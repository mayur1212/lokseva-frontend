"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Files, UserRound } from "lucide-react";
import type { Application, DocumentCategory, Documents, Personal } from "@/types/application";
import { documentCategories } from "@/constants/statuses";
import { apiErrorMessage } from "@/services/api";
import { missingDocuments, personFields } from "@/services/workflowService";
import { Button } from "@/components/ui/button";
import { DocumentUploader } from "./DocumentUploader";

export function ApplicationForm({ application, onSubmit, onCancel }: { application?: Application; onSubmit: (person: Personal, docs: Documents) => Promise<void>; onCancel?: () => void }) {
  const [documents, setDocuments] = useState<Documents>(application?.documents ?? {});
  const [busy, setBusy] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || submitting) return;
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(personFields.map(({key}) => [key, String(data.get(key) ?? "").trim()])) as Record<keyof Personal, string>;
    const invalid = personFields.filter(({ key }) => !values[key]).map(({ label }) => `${label} भरा.`);
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) invalid.push("वैध ई-मेल लिहा.");
    const phone = values.phone.replace(/[\u0966-\u096f]/g, digit => String(digit.charCodeAt(0) - 0x0966));
    if (phone && !/^\d{10}$/.test(phone)) invalid.push("मोबाईल क्रमांक १० अंकांचा असावा.");
    const income = Number(values.income);
    if (values.income && (!Number.isFinite(income) || income < 0)) invalid.push("वार्षिक उत्पन्न शून्य किंवा त्यापेक्षा जास्त असावे.");
    const missing = missingDocuments(documents);
    if (missing.length) invalid.push(`आवश्यक कागदपत्रे जोडा: ${missing.join(", ")}.`);
    setErrors(invalid);
    if (invalid.length) return;
    setSubmitting(true);
    try { await onSubmit({ ...values, phone, income }, documents); }
    catch (cause) { setErrors([apiErrorMessage(cause, "अर्ज जतन करता आला नाही.")]); }
    finally { setSubmitting(false); }
  };
  return <form className="application-form" onSubmit={submit} noValidate>
    {[{ label: "वैयक्तिक माहिती", Icon: UserRound, fields: personFields.slice(0, 7) }, { label: "उत्पन्नाची माहिती", Icon: BriefcaseBusiness, fields: personFields.slice(7) }].map(({ label, Icon, fields }) =>
      <section className="panel form-panel" key={label}><div className="section-heading"><span className="icon-tile blue"><Icon size={19} /></span><h2>{label}</h2></div>
        <div className="form-grid">{fields.map(({ key, label, type }) => <label key={key} className={key === "address" ? "span-full" : undefined}>{label} <span className="required">*</span>
          {key === "address" ? <textarea name={key} rows={2} required defaultValue={application?.[key]} /> :
            <input name={key} type={type ?? "text"} required min={type === "number" ? 0 : undefined} defaultValue={application?.[key]} />}
        </label>)}</div></section>)}
    <section className="panel form-panel"><div className="section-heading"><span className="icon-tile blue"><Files size={19} /></span><h2>कागदपत्रे</h2></div>
      <p className="form-note">चारही कागदपत्रे आवश्यक आहेत. PDF, JPEG किंवा PNG स्वरूपातील प्रत्येक फाइल ७६८ केबीपर्यंत असावी.</p>
      <div className="form-grid upload-grid">{(Object.keys(documentCategories) as DocumentCategory[]).map(category => <DocumentUploader key={category} category={category}
        document={documents[category]} onChange={document => setDocuments(previous => {
          const updated = { ...previous };
          if (document) updated[category] = document;
          else delete updated[category];
          return updated;
        })} onBusy={value => setBusy(previous => previous + (value ? 1 : -1))} />)}</div>
    </section>
    {errors.length > 0 && <ul className="form-error error-list" role="alert">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
    <div className="form-actions">{onCancel ? <Button variant="outline" onClick={onCancel} disabled={submitting}>रद्द करा</Button> : <Link className="button button-outline" href="/applications">रद्द करा</Link>}
      <Button type="submit" disabled={busy > 0 || submitting}>{application ? "सुधारित अर्ज सादर करा" : "अर्ज सादर करा"}</Button>
    </div>
  </form>;
}
