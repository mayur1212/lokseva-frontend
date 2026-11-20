"use client";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { backend } from "@/services/api";
import { useBackendData } from "@/hooks/useBackendData";
import { actions, statuses } from "@/constants/statuses";
import { dateTime } from "@/utils/format";
import { DataError, EmptyState, LoadingSkeleton } from "@/components/ui/Feedback";

export default function HistoryPage() {
  return <ProtectedPage><History /></ProtectedPage>;
}

function History() {
  const history = useBackendData(backend.history);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const query = search.trim().toLowerCase();
  const entries = (history?.data ?? []).filter(entry => (!action || entry.action === action) &&
    [entry.applicationId, entry.applicantName, entry.officer, entry.remarks].some(value => value.toLowerCase().includes(query)));
  const headings = ["अर्ज क्रमांक", "अर्जदाराचे नाव", "अधिकाऱ्याचे नाव", "केलेली कृती", "मागील स्थिती", "नवीन स्थिती", "शेरा", "तारीख आणि वेळ"];
  return <>
    <div className="page-heading"><div><h1>अर्जाचा इतिहास</h1><p>अर्जांवर झालेल्या सर्व कार्यवाहीची नोंद.</p></div></div>
    <section className="panel filter-grid history-filters">
      <label>शोध<div className="search-input"><Search size={18} /><input type="search" placeholder="नाव, अर्ज क्रमांक किंवा शेरा" value={search} onChange={event => setSearch(event.target.value)} /></div></label>
      <label>केलेली कृती<select value={action} onChange={event => setAction(event.target.value)}><option value="">सर्व कृती</option>{Object.entries(actions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    </section>
    {history?.error ? <DataError /> : !history?.data ? <LoadingSkeleton /> : !entries.length ? <EmptyState title="कार्यवाहीची नोंद सापडली नाही" /> :
      <section className="panel table-panel table-scroll"><table className="application-table history-table"><thead><tr>{headings.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
        {entries.map(entry => <tr key={entry.id}>
          <td data-label={headings[0]}><Link className="text-link record-id" href={`/applications/${entry.applicationId}`}>{entry.applicationId}</Link></td>
          <td data-label={headings[1]}>{entry.applicantName}</td><td data-label={headings[2]}>{entry.officer}</td><td data-label={headings[3]}>{actions[entry.action]}</td>
          <td data-label={headings[4]}>{entry.previous ? statuses[entry.previous] : "—"}</td><td data-label={headings[5]}>{statuses[entry.next]}</td>
          <td data-label={headings[6]}>{entry.remarks || "—"}</td><td data-label={headings[7]}>{dateTime(entry.at)}</td>
        </tr>)}
      </tbody></table></section>}
  </>;
}
