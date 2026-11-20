"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ClipboardList, History } from "lucide-react";
import toast from "react-hot-toast";
import { apiErrorMessage, backend, responseStatus, type ApplicationRecord } from "@/services/api";
import { useBackendData } from "@/hooks/useBackendData";
import { useClock } from "@/hooks/useClock";
import { stages } from "@/constants/statuses";
import { isActive, isFinal, priorityInfo } from "@/services/applicationService";
import type { ApplicationDetails as RecordDetails } from "@/types/application";
import type { Review } from "@/services/workflowService";
import type { Decision, Stage } from "@/types/workflow";
import { date } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { DataError, EmptyState, LoadingSkeleton } from "@/components/ui/Feedback";
import { StatusBadge, PriorityBadge } from "@/components/applications/Badges";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { ApplicationStepper } from "./ApplicationStepper";
import { ReviewStage } from "./ReviewStage";
import { HistoryTimeline } from "./HistoryTimeline";
import { ConfirmationModal } from "./ConfirmationModal";

const decisions: Record<Decision, string> = { approved: "मंजूर करा", rejected: "नामंजूर करा", returned: "दुरुस्तीसाठी परत पाठवा" };

function Workflow({ app, reload }: { app: RecordDetails; reload: () => void }) {
  const now = useClock();
  const [selected, setSelected] = useState(app.stage);
  const [intake, setIntake] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [decision, setDecision] = useState<Decision>();
  const [correcting, setCorrecting] = useState(false);
  const [draft, setDraft] = useState<Review>({
    documents: app.documents, documentChecklist: !!app.documentChecklist, incomeChecklist: !!app.incomeChecklist,
    verifiedIncome: app.verifiedIncome,
  });
  const editing = selected === app.stage && isActive(app);
  const priority = priorityInfo(app, now);
  const currentReview = selected === app.stage ? draft : {
    documents: app.documents, documentChecklist: !!app.documentChecklist, incomeChecklist: !!app.incomeChecklist, verifiedIncome: app.verifiedIncome,
  };
  const lastReturn = app.history.findLast(entry => entry.action === "returned");

  function refreshIfStale(cause: unknown) {
    if (responseStatus(cause) !== 409) return false;
    toast.error(apiErrorMessage(cause, "अर्जात बदल झाला आहे. सध्याचा टप्पा पुन्हा तपासा."));
    reload();
    return true;
  }
  async function perform(change: () => Promise<ApplicationRecord>, message: string) {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await change();
      toast.success(message);
      reload();
    } catch (cause) {
      if (!refreshIfStale(cause)) setError(apiErrorMessage(cause, "कार्यवाही जतन करता आली नाही."));
    } finally {
      setSaving(false);
    }
  }
  function requestDecision(value: Decision) {
    if (value !== "approved" && !remarks.trim()) { setError("कारण आणि आवश्यक दुरुस्त्या शेरामध्ये लिहा."); return; }
    setError("");
    setDecision(value);
  }

  return <div className="details-page">
    <div className="page-heading">
      <div><Link href="/applications" className="text-link back-link">सर्व अर्ज</Link><h1>{app.name}</h1><p className="record-id">{app.id}</p></div>
      <div className="heading-actions"><StatusBadge status={app.status} /><PriorityBadge priority={priority.value} /></div>
    </div>
    <div className="panel detail-meta"><span>अर्जाची तारीख <strong>{date(app.submitted)}</strong></span><span>Deadline <strong>{date(app.deadline)}</strong></span>
      <span>प्राधान्याचे कारण <strong>{priority.reason}</strong></span></div>
    <ApplicationStepper stage={app.stage} selected={selected} closed={isFinal(app)} documentChecklist={!!app.documentChecklist} onSelect={stage => { setSelected(stage); setError(""); }} />
    {app.status === "returned" && <section className="panel return-panel">
      <h2>दुरुस्तीसाठी परत पाठवलेला अर्ज</h2>
      <p><strong>परत पाठवण्याचे कारण आणि आवश्यक दुरुस्त्या</strong></p><p>{lastReturn?.remarks}</p>
      {!correcting && <Button onClick={() => setCorrecting(true)}>अर्ज दुरुस्त करा</Button>}
    </section>}
    {correcting ? <ApplicationForm application={app} onCancel={() => setCorrecting(false)} onSubmit={async (person, documents) => {
      try { await backend.resubmit(app, person, documents); }
      catch (cause) {
        if (refreshIfStale(cause)) return;
        throw cause;
      }
      toast.success("दुरुस्त अर्ज पुन्हा सादर झाला.");
      reload();
    }} /> : <div className="workflow-grid">
      <section className="panel stage-panel">
        <div className="section-heading"><span className="icon-tile blue"><ClipboardList size={19} /></span><h2>{stages[selected]}</h2></div>
        <div className="stage-body">
          <ReviewStage app={app} stage={selected} review={currentReview} editing={editing} intake={intake}
            onIntake={setIntake} update={value => setDraft(previous => ({ ...previous, ...value }))} onViewDocuments={() => setSelected(1)} />
          {editing ? <label>{selected === 2 ? "उत्पन्न पडताळणीचा शेरा" : "अधिकाऱ्याचा शेरा"}<textarea value={remarks} rows={4} onChange={event => setRemarks(event.target.value)} placeholder="निरीक्षणे आणि कारण लिहा" /></label> : <p className="muted">या टप्प्याची माहिती पाहण्यासाठी उपलब्ध आहे.</p>}
          {error && <p role="alert" className="form-error">{error}</p>}
          <div className="stage-actions">
            {selected > 0 && <Button variant="outline" onClick={() => { setSelected((selected - 1) as Stage); setError(""); }}>मागील टप्पा</Button>}
            {selected < app.stage && <Button variant="outline" onClick={() => setSelected(app.stage)}>सध्याचा टप्पा पहा</Button>}
            {editing && <div>
              <Button variant="outline" disabled={saving} onClick={() => requestDecision("returned")}>{decisions.returned}</Button>
              {selected === 3 ? <>
                <Button variant="danger" disabled={saving} onClick={() => requestDecision("rejected")}>{decisions.rejected}</Button>
                <Button className="button-approve" disabled={saving} onClick={() => requestDecision("approved")}>{decisions.approved}</Button>
              </> : <Button disabled={saving} onClick={() => perform(() => backend.advance(app, draft, remarks, intake), selected === 1 ? "अर्ज उत्पन्न पडताळणीच्या टप्प्यावर गेला." : "टप्पा यशस्वीरीत्या पूर्ण झाला.")}>पुढील टप्प्यावर जा</Button>}
            </div>}
          </div>
        </div>
      </section>
      <AIAssistant key={selected} stage={selected} applicationId={app.id} onUse={editing ? setRemarks : undefined} />
    </div>}
    <section className="panel history-panel"><div className="section-heading"><span className="icon-tile blue"><History size={19} /></span><h2>अर्जाचा इतिहास</h2></div><HistoryTimeline entries={app.history} /></section>
    <ConfirmationModal open={!!decision} title={decision ? decisions[decision] : "निर्णय निश्चित करा"} description={`${app.name} · ${remarks.trim() || "या अर्जावरील निर्णय नोंदवायचा आहे का?"}`}
      danger={decision === "rejected"} onClose={() => setDecision(undefined)} onConfirm={() => {
        if (!decision) return;
        setDecision(undefined);
        void perform(() => backend.decide(app, decision, remarks), "निर्णय नोंदवला.");
      }} />
  </div>;
}

export function ApplicationDetails({ id }: { id: string }) {
  const [revision, setRevision] = useState(0);
  const load = useCallback((signal: AbortSignal) => backend.details(id, signal), [id]);
  const result = useBackendData(load, revision);
  if (responseStatus(result?.error) === 404) return <><EmptyState title="अर्ज सापडला नाही" /><Link className="button button-outline back-link" href="/applications">सर्व अर्ज पहा</Link></>;
  if (result?.error) return <DataError />;
  const app = result?.data;
  if (!app) return <LoadingSkeleton />;
  return <Workflow key={`${app.id}-${app.version}`} app={app} reload={() => setRevision(previous => previous + 1)} />;
}
