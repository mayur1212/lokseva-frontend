import axios from "axios";
import type { Application, ApplicationDetails, Documents, HistoryEntry, Personal, Priority } from "@/types/application";
import type { Officer } from "@/types/auth";
import type { Decision, Stage } from "@/types/workflow";
import type { Review } from "./workflowService";

export type Analysis = { source: "rules" | "openai"; summary: string; missing: string[]; discrepancies: string[]; suggestions: string[]; remarks: string };
export type Statistics = {
  total: number; pending: number; review: number; approved: number; rejected: number; returned: number;
  active: number; overdue: number; completed: number; average: number | null; onTime: number | null;
};
export type AuditEntry = HistoryEntry & { applicationId: string; applicantName: string };
export type ApplicationRecord = Omit<Application, "verifiedIncome"> & { verifiedIncome: number | null };
type Page<T> = { items: T[]; total: number; page: number; pageSize: number };
type ApiError = { code?: string; message?: string; fieldErrors?: Record<string, string[]> };

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

export const responseStatus = (error: unknown) => axios.isAxiosError(error) ? error.response?.status : undefined;

export function apiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiError>(error)) return fallback;
  const data = error.response?.data;
  return [data?.message || fallback, ...Object.values(data?.fieldErrors ?? {}).flat()].join(" ");
}

export const sessionExpired = "lokseva-session-expired";
api.interceptors.response.use(undefined, error => {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data?.code === "UNAUTHENTICATED" && typeof window !== "undefined") {
    window.dispatchEvent(new Event(sessionExpired));
  }
  return Promise.reject(error);
});

const applicationPath = (id: string) => `/applications/${encodeURIComponent(id)}`;

async function allPages<T>(path: string, signal?: AbortSignal) {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const { data } = await api.get<Page<T>>(path, { params: { page, pageSize: 100 }, signal });
    items.push(...data.items);
    if (!data.items.length || data.page * data.pageSize >= data.total) return items;
  }
}

async function multipart(payload: object, documents: Documents) {
  const form = new FormData();
  form.append("payload", JSON.stringify(payload));
  await Promise.all(Object.entries(documents).map(async ([category, document]) => {
    if (document.url.startsWith("data:")) {
      const response = await fetch(document.url);
      form.append(category, await response.blob(), document.name);
    }
  }));
  return form;
}

function normalizeApplication(app: ApplicationRecord): Application {
  return { ...app, verifiedIncome: app.verifiedIncome ?? undefined };
}

async function dashboardApplications(signal: AbortSignal, pageSize: number, priority?: Exclude<Priority, "normal">) {
  const { data } = await api.get<Page<ApplicationRecord>>("/applications", {
    params: { page: 1, pageSize, priority, sort: priority ? "priority" : "newest" },
    signal,
  });
  return data.items.map(normalizeApplication);
}

export const backend = {
  login: async (email: string, password: string) => (await api.post<Officer>("/auth/login", { email, password })).data,
  me: async (signal: AbortSignal) => (await api.get<Officer>("/auth/me", { signal })).data,
  logout: () => api.post("/auth/logout"),
  async dashboard(signal: AbortSignal) {
    const [stats, recent, urgent, high] = await Promise.all([
      api.get<Statistics>("/dashboard/statistics", { signal }),
      dashboardApplications(signal, 5),
      dashboardApplications(signal, 8, "urgent"),
      dashboardApplications(signal, 8, "high"),
    ]);
    return { stats: stats.data, recent, priority: [...urgent, ...high].slice(0, 8) };
  },
  list: async (signal: AbortSignal) => (await allPages<ApplicationRecord>("/applications", signal)).map(normalizeApplication),
  history: (signal: AbortSignal) => allPages<AuditEntry>("/history", signal),
  async details(id: string, signal?: AbortSignal) {
    const path = applicationPath(id);
    const { data } = await api.get<ApplicationRecord>(path, { signal });
    const history = await api.get<HistoryEntry[]>(`${path}/history`, { signal });
    return { ...normalizeApplication(data), history: history.data };
  },
  async create(person: Personal, documents: Documents) {
    return (await api.post<ApplicationRecord>("/applications", await multipart(person, documents))).data;
  },
  async resubmit(app: ApplicationDetails, fields: Personal, documents: Documents) {
    const removeDocuments = Object.keys(app.documents).filter(category => !Object.hasOwn(documents, category));
    const form = await multipart({ version: app.version, fields, removeDocuments }, documents);
    return (await api.post<ApplicationRecord>(`${applicationPath(app.id)}/resubmit`, form)).data;
  },
  async advance(app: ApplicationDetails, review: Review, remarks: string, intakeConfirmed: boolean) {
    const path = applicationPath(app.id);
    const common = { version: app.version, remarks };
    if (app.stage === 0) return (await api.post<ApplicationRecord>(`${path}/workflow`, { ...common, intakeConfirmed })).data;
    if (app.stage === 1) {
      const results = Object.fromEntries(Object.entries(review.documents).map(([category, doc]) => [category, doc.verification]));
      return (await api.post<ApplicationRecord>(`${path}/documents/verification`, { ...common, results, checklist: review.documentChecklist })).data;
    }
    return (await api.post<ApplicationRecord>(`${path}/income/verification`, { ...common, verifiedIncome: review.verifiedIncome, checklist: review.incomeChecklist })).data;
  },
  decide: async (app: ApplicationDetails, decision: Decision, remarks: string) =>
    (await api.post<ApplicationRecord>(`${applicationPath(app.id)}/decision`, { decision, remarks, version: app.version })).data,
  analyze: async (id: string, stage: Stage) => (await api.post<Analysis>(`${applicationPath(id)}/analysis`, { stage })).data,
  document: async (url: string, signal: AbortSignal) => (await api.get<Blob>(url, { signal, responseType: "blob" })).data,
};
