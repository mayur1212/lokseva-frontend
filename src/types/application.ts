import type { Stage, Verification } from "./workflow";

export type Status = "new" | "pending" | "review" | "decision" | "approved" | "rejected" | "returned";
export type Priority = "urgent" | "high" | "normal";
export type Personal = {
  name: string; phone: string; email: string; district: string; taluka: string;
  village: string; address: string; occupation: string; source: string; income: number; purpose: string;
};
export type DocumentCategory = "identity" | "residence" | "income" | "declaration";
export type ApplicationDocument = {
  name: string; size: number; url: string; verification: Verification; contentType?: string;
};
export type Documents = Partial<Record<DocumentCategory, ApplicationDocument>>;
export type HistoryAction = "created" | "intake" | "documents" | "income" | "approved" | "rejected" | "returned" | "resubmitted";
export type HistoryEntry = {
  id: string; officer: string; action: HistoryAction; previous: Status | null; next: Status;
  remarks: string; at: string;
};
export type Application = Personal & {
  id: string; submitted: string; deadline: string; status: Status; stage: Stage;
  documents: Documents; verifiedIncome?: number; documentChecklist?: boolean;
  incomeChecklist?: boolean; version: number;
};

export type ApplicationDetails = Application & { history: HistoryEntry[] };
