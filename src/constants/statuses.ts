import type { DocumentCategory, HistoryAction, Priority, Status } from "@/types/application";
import type { Verification } from "@/types/workflow";

export const statuses: Record<Status, string> = {
  new: "नवीन अर्ज", pending: "प्रलंबित", review: "पडताळणी सुरू", decision: "अंतिम निर्णय बाकी",
  approved: "मंजूर", rejected: "नामंजूर", returned: "दुरुस्तीसाठी परत",
};
export const stages = ["अर्ज स्वीकारणे", "कागदपत्रांची पडताळणी", "उत्पन्नाची पडताळणी", "अंतिम निर्णय"] as const;
export const priorities: Record<Priority, string> = { urgent: "तातडीचे", high: "उच्च", normal: "सामान्य" };
export const documentCategories: Record<DocumentCategory, string> = {
  identity: "ओळखपत्र", residence: "रहिवासी पुरावा", income: "उत्पन्नाचा पुरावा", declaration: "स्वयंघोषणापत्र",
};
export const verificationLabels: Record<Verification, string> = {
  waiting: "पडताळणी बाकी", verified: "पडताळणी पूर्ण", incomplete: "अपूर्ण", invalid: "अवैध",
};
export const actions: Record<HistoryAction, string> = {
  created: "अर्ज तयार केला", intake: "अर्ज स्वीकारला", documents: "कागदपत्र पडताळणीची नोंद",
  income: "उत्पन्नाची पडताळणी पूर्ण", approved: "अर्ज मंजूर केला", rejected: "अर्ज नामंजूर केला",
  returned: "दुरुस्तीसाठी परत पाठवलेला अर्ज", resubmitted: "दुरुस्त अर्ज पुन्हा सादर केला",
};
