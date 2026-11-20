import { priorities, statuses } from "@/constants/statuses";
import type { Priority, Status } from "@/types/application";

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge status-${status}`}><i />{statuses[status]}</span>;
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge priority-${priority}`}><i />{priorities[priority]}</span>;
}
