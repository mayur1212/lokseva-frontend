import { documentCategories } from "@/constants/statuses";
import type { DocumentCategory, Documents, Personal } from "@/types/application";

export type Review = { documents: Documents; documentChecklist: boolean; incomeChecklist: boolean; verifiedIncome?: number };
const keys = Object.keys(documentCategories) as DocumentCategory[];

export function missingFields(person: Personal) {
  return Object.values(personFields).filter(({ key }) => {
    const value = person[key];
    return typeof value === "number" ? !Number.isFinite(value) || value < 0 : !value.trim();
  }).map(field => field.label);
}

export const personFields: { key: keyof Personal; label: string; type?: string }[] = [
  { key: "name", label: "अर्जदाराचे पूर्ण नाव" }, { key: "phone", label: "मोबाईल क्रमांक", type: "tel" },
  { key: "email", label: "ई-मेल", type: "email" }, { key: "district", label: "जिल्हा" },
  { key: "taluka", label: "तालुका" }, { key: "village", label: "गाव / शहर" }, { key: "address", label: "संपूर्ण पत्ता" },
  { key: "occupation", label: "व्यवसाय" }, { key: "source", label: "उत्पन्नाचा स्रोत" },
  { key: "income", label: "वार्षिक उत्पन्न", type: "number" }, { key: "purpose", label: "अर्जाचा उद्देश" },
];

export const missingDocuments = (documents: Documents) => keys.filter(key => !documents[key]).map(key => documentCategories[key]);
