import type { LucideIcon } from "lucide-react";
import { number } from "@/utils/format";

export function DashboardCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: LucideIcon; color: string }) {
  return <div className="panel dashboard-card"><span className={`icon-tile ${color}`}><Icon size={20} /></span><span>{label}</span><strong>{number(value)}</strong></div>;
}
