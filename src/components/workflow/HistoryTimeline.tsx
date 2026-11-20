import { actions, statuses } from "@/constants/statuses";
import type { HistoryEntry } from "@/types/application";
import { dateTime } from "@/utils/format";

export function HistoryTimeline({ entries }: { entries: HistoryEntry[] }) {
  return <ol className="timeline">{[...entries].reverse().map(entry => <li key={entry.id}>
    <strong>{actions[entry.action]}</strong>
    <span>{entry.officer} · {dateTime(entry.at)}</span>
    <span>{entry.previous ? `मागील स्थिती — ${statuses[entry.previous]} · ` : ""}नवीन स्थिती — {statuses[entry.next]}</span>
    {entry.remarks && <p>{entry.remarks}</p>}
  </li>)}</ol>;
}
