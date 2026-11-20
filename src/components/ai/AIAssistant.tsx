"use client";

import { useState } from "react";
import { Sparkles, RotateCw } from "lucide-react";
import { backend, type Analysis } from "@/services/api";
import type { Stage } from "@/types/workflow";
import { Button } from "@/components/ui/button";

export function AIAssistant({ applicationId, stage, onUse }: { applicationId: string; stage: Stage; onUse?: (remarks: string) => void }) {
  const [analysis, setAnalysis] = useState<Analysis>();
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function run() {
    setError(false); setLoading(true); setAnalysis(undefined);
    try {
      const result = await backend.analyze(applicationId, stage);
      setAnalysis(result); setRemarks(result.remarks);
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  return <aside className="panel ai-panel">
    <div className="section-heading"><span className="icon-tile violet"><Sparkles size={19} /></span><h2>AI सहाय्यक</h2></div>
    <div className="ai-body">
      {!analysis && <p className="muted">या टप्प्यासाठी अर्जातील उपलब्ध माहितीचा आढावा घ्या.</p>}
      {error && <p className="form-error" role="alert">विश्लेषण पूर्ण झाले नाही. पुन्हा प्रयत्न करा.</p>}
      {analysis && <div className="ai-result" aria-live="polite">
        <p className="muted">{analysis.source === "openai" ? "AI ने सुचवलेली कार्यवाही" : "उपलब्ध नोंदींवर आधारित तपासणी सूचना"}</p>
        <div><h3>अर्जाचा सारांश</h3><p>{analysis.summary}</p></div>
        {[{ label: "अपूर्ण माहिती", values: analysis.missing }, { label: "संभाव्य तफावत", values: analysis.discrepancies }, { label: "सुचवलेली कार्यवाही", values: analysis.suggestions }].map(({ label, values }) =>
          <div key={label}><h3>{label}</h3>{values.length ? <ul>{values.map(value => <li key={value}>{value}</li>)}</ul> : <p>उपलब्ध माहितीत आढळली नाही.</p>}</div>)}
        <label>सुचवलेला शेरा<textarea rows={4} value={remarks} onChange={event => setRemarks(event.target.value)} /></label>
        {onUse && <Button variant="outline" onClick={() => onUse(remarks)}>शेरा वापरा</Button>}
      </div>}
      <Button variant={analysis ? "outline" : "default"} onClick={run} disabled={loading} aria-busy={loading}>
        {analysis || error ? <RotateCw size={16} /> : <Sparkles size={16} />}{loading ? "विश्लेषण सुरू आहे…" : analysis || error ? "पुन्हा विश्लेषण करा" : "विश्लेषण करा"}
      </Button>
      <p className="ai-disclaimer">AI द्वारे दिलेली माहिती केवळ सहाय्यासाठी आहे. अंतिम निर्णय संबंधित अधिकाऱ्याने घ्यावा.</p>
    </div>
  </aside>;
}
