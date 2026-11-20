"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useApplications } from "@/context/ApplicationContext";
import { statuses, stages, priorities } from "@/constants/statuses";
import { byPriority, isActive, priorityInfo } from "@/services/applicationService";
import { useClock } from "@/hooks/useClock";
import { Button } from "@/components/ui/button";
import { DataError, EmptyState, LoadingSkeleton } from "@/components/ui/Feedback";
import { ApplicationTable } from "./ApplicationTable";
import { number } from "@/utils/format";

const pageSize = 8;

export function ApplicationList({ pending = false }: { pending?: boolean }) {
  const { applications, error } = useApplications();
  const now = useClock();
  const [filter, setFilter] = useState({ search: "", status: "", stage: "", priority: "", sort: "newest" });
  const [page, setPage] = useState(1);
  const change = (key: keyof typeof filter, value: string) => {
    setFilter(previous => ({ ...previous, [key]: value }));
    setPage(1);
  };
  const query = filter.search.trim().toLocaleLowerCase();
  const results = applications?.filter(app =>
    (!pending || isActive(app)) &&
    (!query || app.name.toLocaleLowerCase().includes(query) || app.id.toLowerCase().includes(query)) &&
    (!filter.status || app.status === filter.status) &&
    (!filter.stage || String(app.stage) === filter.stage) &&
    (!filter.priority || priorityInfo(app, now).value === filter.priority),
  ).sort((a, b) => (pending ? byPriority(a, b, now) : 0) || (filter.sort === "oldest" ? a.submitted.localeCompare(b.submitted) : b.submitted.localeCompare(a.submitted))) ?? [];
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;

  return <>
    <div className="page-heading"><div><h1>{pending ? "प्रलंबित अर्ज" : "सर्व अर्ज"}</h1><p>{pending ? "अधिकाऱ्याच्या कार्यवाहीची प्रतीक्षा असलेले अर्ज." : "उत्पन्नाच्या दाखल्यासाठी प्राप्त अर्ज शोधा आणि तपासा."}</p></div>
      <Link className="button button-primary" href="/applications/new"><Plus size={18} /> नवीन अर्ज</Link></div>
    <section className="panel filter-grid" aria-label="अर्ज शोध आणि फिल्टर">
      <label className="search-label">शोध<div className="search-input"><Search size={18} /><input type="search" value={filter.search} placeholder="नाव किंवा अर्ज क्रमांक" onChange={event => change("search", event.target.value)} /></div></label>
      <label>स्थिती<select value={filter.status} onChange={event => change("status", event.target.value)}><option value="">सर्व स्थिती</option>{Object.entries(statuses).filter(([key]) => !pending || !["approved", "rejected", "returned"].includes(key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label>सध्याचा टप्पा<select value={filter.stage} onChange={event => change("stage", event.target.value)}><option value="">सर्व टप्पे</option>{stages.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>
      <label>प्राधान्य<select value={filter.priority} onChange={event => change("priority", event.target.value)}><option value="">सर्व प्राधान्ये</option>{Object.entries(priorities).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      {!pending && <label>अर्जाची तारीख<select value={filter.sort} onChange={event => change("sort", event.target.value)}><option value="newest">नवीन अर्ज आधी</option><option value="oldest">जुने अर्ज आधी</option></select></label>}
    </section>
    {error ? <DataError /> : !applications ? <LoadingSkeleton /> : !results.length ? <EmptyState description="शोध किंवा फिल्टर बदलून पुन्हा पहा." /> :
      <section className="panel table-panel" aria-label={pending ? "प्रलंबित अर्जांची यादी" : "सर्व अर्जांची यादी"}>
        <ApplicationTable applications={results.slice(start, start + pageSize)} now={now} mode={pending ? "pending" : "all"} />
        <div className="pagination"><p>एकूण {number(results.length)} अर्जांपैकी {number(start + 1)}–{number(Math.min(start + pageSize, results.length))}</p>
          <div><Button variant="outline" disabled={current <= 1} onClick={() => setPage(current - 1)}>मागील</Button>
            <span>{number(current)} / {number(pageCount)}</span>
            <Button variant="outline" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>पुढील</Button></div></div>
      </section>}
  </>;
}
