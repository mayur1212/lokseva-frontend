import type { Application, Priority } from "@/types/application";
import { day } from "@/utils/format";

export const isFinal = (app: Application) => app.status === "approved" || app.status === "rejected";
export const isActive = (app: Application) => !isFinal(app) && app.status !== "returned";

export function priorityInfo(app: Application, now = Date.now()): { value: Priority; reason: string } {
  const remaining = Date.parse(app.deadline) - now;
  if (isFinal(app)) return { value: "normal", reason: "प्रक्रिया पूर्ण" };
  if (remaining <= 0) return { value: "urgent", reason: "अंतिम मुदत संपली" };
  if (app.status === "returned") return { value: "high", reason: "अर्जदाराकडून दुरुस्ती अपेक्षित" };
  if (remaining <= 2 * day) return { value: "urgent", reason: "अंतिम मुदत जवळ आली आहे" };
  if (app.status === "pending" || app.status === "review") return { value: "high", reason: "पडताळणी बाकी" };
  if (app.status === "decision") return { value: "high", reason: "अंतिम निर्णय बाकी" };
  return { value: "normal", reason: "नियमित प्रक्रिया" };
}
export function byPriority(a: Application, b: Application, now: number) {
  const order = { urgent: 0, high: 1, normal: 2 };
  return order[priorityInfo(a, now).value] - order[priorityInfo(b, now).value] || a.deadline.localeCompare(b.deadline);
}
