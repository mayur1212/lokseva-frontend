/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import type { ApplicationDocument } from "@/types/application";
import { backend } from "@/services/api";
import { number } from "@/utils/format";

function DocumentContent({ document }: { document: ApplicationDocument }) {
  const local = document.url.startsWith("data:");
  const [preview, setPreview] = useState<{ url: string; pdf: boolean } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (local) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    backend.document(document.url, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setPreview({ url: objectUrl, pdf: blob.type === "application/pdf" });
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.url, local]);

  if (error) return <p className="form-error" role="alert">कागदपत्र उघडता आले नाही. पुन्हा प्रयत्न करा.</p>;
  const content = local ? { url: document.url, pdf: document.url.startsWith("data:application/pdf") } : preview;
  if (!content) return <p role="status">कागदपत्र लोड होत आहे…</p>;
  return content.pdf
    ? <object data={content.url} type="application/pdf" aria-label={document.name}><p>या ब्राउझरमध्ये PDF चे पूर्वावलोकन उघडता आले नाही.</p></object>
    : <img src={content.url} alt={document.name} />;
}

export function DocumentPreview({ document }: { document: ApplicationDocument }) {
  const [open, setOpen] = useState(false);
  return <details className="document-preview" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><FileText size={17} /><span>{document.name} <small>· {number(document.size / 1024)} केबी</small></span><span className="text-link">प्रत पहा</span></summary>
    {open && <DocumentContent key={document.url} document={document} />}
  </details>;
}
