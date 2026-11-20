import { LayoutDashboard, Files, Clock3, FilePlus2, History } from "lucide-react";

export const navigation = [
  { href: "/dashboard", label: "मुख्य पृष्ठ", icon: LayoutDashboard },
  { href: "/applications", label: "सर्व अर्ज", icon: Files },
  { href: "/applications/pending", label: "प्रलंबित अर्ज", icon: Clock3 },
  { href: "/applications/new", label: "नवीन अर्ज", icon: FilePlus2 },
  { href: "/history", label: "अर्जाचा इतिहास", icon: History },
];
