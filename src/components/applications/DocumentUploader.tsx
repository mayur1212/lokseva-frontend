"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { documentCategories } from "@/constants/statuses";
import type { ApplicationDocument, DocumentCategory } from "@/types/application";
import { Button } from "@/components/ui/button";
import { DocumentPreview } from "./DocumentPreview";

const supported = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };

export function DocumentUploader({ category, document, onChange, onBusy }: { category: DocumentCategory; document?: ApplicationDocument; onChange: (document?: ApplicationDocument) => void; onBusy: (busy: boolean) => void }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    const ext = file.name.split(".").at(-1)?.toLowerCase() as keyof typeof supported;
    if (!Object.hasOwn(supported, ext) || (file.type && file.type !== supported[ext])) { setError("पीडीएफ, जेपीजी किंवा पीएनजी फाइल निवडा."); return; }
    if (file.size > 768 * 1024 || !file.size) { setError("फाइल रिकामी नसावी आणि ७६८ केबीपेक्षा लहान असावी."); return; }
    setError("");
    setLoading(true);
    onBusy(true);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(new Blob([file], { type: supported[ext] }));
      });
      onChange({ name: file.name, size: file.size, url, verification: "waiting" });
    } catch { setError("फाइल वाचता आली नाही. पुन्हा प्रयत्न करा."); }
    finally { setLoading(false); onBusy(false); }
  }
  return <div className="upload-item">
    <strong>{documentCategories[category]}</strong>
    {document && <DocumentPreview document={document} />}
    <div className="upload-actions">
      <label className="button button-outline upload-trigger"><Upload size={16} />{loading ? "फाइल वाचत आहे…" : document ? "प्रत बदला" : "फाइल निवडा"}
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" aria-label={documentCategories[category]} disabled={loading} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
      </label>
      {document && <Button variant="ghost" disabled={loading} onClick={() => { onChange(); setError(""); }}><X size={16} /> काढा</Button>}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
