"use client";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import Link from "next/link";
import { CalendarDays, CircleCheck, CircleX, ClipboardCheck, Clock3, Files, FileUp, Gauge, Plus, TriangleAlert } from "lucide-react";
import { backend } from "@/services/api";
import { useBackendData } from "@/hooks/useBackendData";
import { useAuth } from "@/context/AuthContext";
import { priorityInfo } from "@/services/applicationService";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { PriorityBadge } from "@/components/applications/Badges";
import { DataError, EmptyState, LoadingSkeleton } from "@/components/ui/Feedback";
import { useClock } from "@/hooks/useClock";
import { date, number } from "@/utils/format";

export default function DashboardPage() {
  return <ProtectedPage><Dashboard /></ProtectedPage>;
}

function Dashboard() {
  const { officer } = useAuth();
  const now = useClock();
  const dashboard = useBackendData(backend.dashboard);
  if (dashboard?.error) return <DataError />;
  if (!dashboard?.data) return <LoadingSkeleton />;
  const { stats, priority, recent } = dashboard.data;

  return <div className="dashboard">
    <div className="page-heading"><div><h1>मुख्य पृष्ठ</h1><p>{`नमस्कार, ${officer?.name}. आजच्या अर्जांचा आढावा.`}</p></div><div className="heading-actions">
      <span className="date-chip"><CalendarDays size={17} />{date(new Date(now).toISOString())}</span>
      <Link className="button button-primary" href="/applications/new"><Plus size={18} /> नवीन अर्ज</Link>
    </div></div>
    <div className="summary-grid">
      <DashboardCard label="एकूण अर्ज" value={stats.total} icon={Files} color="blue" />
      <DashboardCard label="प्रलंबित अर्ज" value={stats.pending} icon={Clock3} color="orange" />
      <DashboardCard label="पडताळणी सुरू" value={stats.review} icon={ClipboardCheck} color="violet" />
      <DashboardCard label="मंजूर अर्ज" value={stats.approved} icon={CircleCheck} color="green" />
      <DashboardCard label="नामंजूर अर्ज" value={stats.rejected} icon={CircleX} color="red" />
      <DashboardCard label="परत पाठवलेले अर्ज" value={stats.returned} icon={FileUp} color="amber" />
    </div>
    <section className="panel priority-panel">
      <div className="section-heading"><span className="icon-tile amber"><TriangleAlert size={19} /></span><h2>तातडीने लक्ष देण्याचे अर्ज</h2><Link className="text-link" href="/applications/pending">प्रलंबित अर्ज पहा</Link></div>
      {priority.length ? <div className="priority-grid">{priority.map(app => {
        const { value, reason } = priorityInfo(app, now);
        return <Link key={app.id} href={`/applications/${app.id}`} className="priority-item">
          <div><strong>{app.name}</strong><PriorityBadge priority={value} /></div><span className="record-id">{app.id}</span><p>{reason}</p>
        </Link>;
      })}</div> : <EmptyState title="तातडीचे अर्ज उपलब्ध नाहीत" />}
    </section>
    <section className="panel table-panel">
      <div className="section-heading"><span className="icon-tile blue"><Files size={19} /></span><h2>अलीकडील अर्ज</h2><Link className="text-link" href="/applications">सर्व अर्ज पहा</Link></div>
      {recent.length ? <ApplicationTable applications={recent} now={now} mode="recent" /> : <EmptyState />}
    </section>
    <section className="panel metrics-panel">
      <div className="section-heading"><span className="icon-tile green"><Gauge size={19} /></span><h2>अर्ज प्रक्रियेची कामगिरी</h2></div>
      <dl className="metrics">
        <div><dt>सरासरी प्रक्रिया कालावधी</dt><dd>{stats.average === null ? "—" : `${number(stats.average)} दिवस`}</dd></div>
        <div><dt>कार्यवाहीसाठी प्रलंबित</dt><dd>{number(stats.active)}</dd></div>
        <div><dt>मुदत संपलेले अर्ज</dt><dd>{number(stats.overdue)}</dd></div>
        <div><dt>पूर्ण झालेले अर्ज</dt><dd>{number(stats.completed)}</dd></div>
        <div><dt>वेळेत पूर्ण झालेले अर्ज</dt><dd>{stats.onTime === null ? "—" : `${number(stats.onTime)}%`}</dd></div>
      </dl>
    </section>
  </div>;
}
