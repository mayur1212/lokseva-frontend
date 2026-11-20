import { documentCategories, stages, verificationLabels } from "@/constants/statuses";
import type { Application, ApplicationDetails, DocumentCategory } from "@/types/application";
import type { Stage, Verification } from "@/types/workflow";
import { missingDocuments, missingFields, personFields, type Review } from "@/services/workflowService";
import { money } from "@/utils/format";
import { DocumentPreview } from "@/components/applications/DocumentPreview";
import { Button } from "@/components/ui/button";

export function ApplicantFacts({ app, personal = true }: { app: Application; personal?: boolean }) {
  const fields = personal ? personFields : personFields.slice(7);
  return <dl className="facts">{fields.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{key === "income" ? money(app.income) : app[key] || "—"}</dd></div>)}</dl>;
}

export function ReviewStage({ app, stage, review, update, editing, intake, onIntake, onViewDocuments }: {
  app: ApplicationDetails; stage: Stage; review: Review; update: (update: Partial<Review>) => void; editing: boolean;
  intake: boolean; onIntake: (value: boolean) => void; onViewDocuments: () => void;
}) {
  const categories = Object.keys(documentCategories) as DocumentCategory[];
  switch (stage) {
    case 0:
      return <>
        <ApplicantFacts app={app} />
        <div className="review-block"><h3>सादर केलेली कागदपत्रे</h3>
          <ul className="review-list">{categories.map(key => <li key={key}>{documentCategories[key]} <span>{app.documents[key] ? "सादर केले" : "उपलब्ध नाही"}</span></li>)}</ul>
          {missingFields(app).length > 0 && <p className="notice">अपूर्ण माहिती — {missingFields(app).join(", ")}</p>}
        </div>
        {editing && <label className="checkbox"><input type="checkbox" checked={intake} onChange={event => onIntake(event.target.checked)} /> आवश्यक अर्ज माहिती पूर्ण असल्याची खात्री केली.</label>}
      </>;
    case 1:
      return <>
        <p className="muted">जोडलेली प्रत्येक फाइल उघडा आणि पडताळणीचा निकाल नोंदवा.</p>
        {editing && missingDocuments(app.documents).length > 0 && <p className="notice">
          काही कागदपत्रे नसली तरी उत्पन्न पडताळणीला जाता येईल. उर्वरित कागदपत्रे जोडून तपासेपर्यंत कागदपत्र पडताळणी अपूर्ण राहील.
        </p>}
        <div className="verification-list">{categories.map(key => {
          const document = review.documents[key];
          return <div className="verification-item" key={key}>
            <div><strong>{documentCategories[key]}</strong>{document ? <DocumentPreview document={document} /> : <p className="notice">फाइल जोडलेली नाही.</p>}</div>
            {document && (editing ? <label>पडताळणीचा निकाल<select value={document.verification} onChange={event => update({
              documents: { ...review.documents, [key]: { ...document, verification: event.target.value as Verification } },
            })}>{Object.entries(verificationLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label> : <span>{verificationLabels[document.verification]}</span>)}
          </div>;
        })}</div>
        {editing && <label className="checkbox"><input type="checkbox" checked={review.documentChecklist} onChange={event => update({ documentChecklist: event.target.checked })} /> नाव, पत्ता आणि कागदपत्रांतील माहिती संबंधित नोंदींशी तपासली.</label>}
      </>;
    case 2:
      return <>
        <ApplicantFacts app={app} personal={false} />
        <div className="review-block"><h3>उपलब्ध उत्पन्नाचा पुरावा</h3>
          {review.documents.income ? <DocumentPreview document={review.documents.income} /> : <p className="notice">उत्पन्नाचा पुरावा उपलब्ध नाही. अधिकाऱ्याने प्रत्यक्ष पडताळणी करावी.</p>}
        </div>
        <label>पडताळलेले वार्षिक उत्पन्न<input type="number" min={0} step="any" value={review.verifiedIncome ?? ""} readOnly={!editing} onChange={event => update({ verifiedIncome: event.target.value === "" ? undefined : event.target.valueAsNumber })} /></label>
        {editing && <label className="checkbox"><input type="checkbox" checked={review.incomeChecklist} onChange={event => update({ incomeChecklist: event.target.checked })} /> उत्पन्नाचे स्रोत, रक्कम आणि कालावधी तपासले.</label>}
      </>;
    case 3: {
      const incomplete = [...missingDocuments(app.documents)];
      if (!app.documentChecklist) incomplete.push("कागदपत्र पडताळणी अपूर्ण आहे.");
      if (!app.incomeChecklist || app.verifiedIncome === undefined) incomplete.push("उत्पन्नाची पडताळणी बाकी.");
      if (app.verifiedIncome !== undefined && app.verifiedIncome !== app.income) incomplete.push("घोषित आणि पडताळलेल्या उत्पन्नात तफावत आहे.");
      return <>
        <ApplicantFacts app={app} />
        <dl className="facts review-block"><div><dt>पडताळलेले वार्षिक उत्पन्न</dt><dd>{app.verifiedIncome === undefined ? "—" : money(app.verifiedIncome)}</dd></div>
          <div><dt>पूर्ण पडताळणी टप्पे</dt><dd>{stages.slice(0, 3).filter((_, index) => index === 0 || (index === 1 ? app.documentChecklist : app.incomeChecklist)).join(" · ")}</dd></div></dl>
        <div className="review-block"><h3>कागदपत्र पडताळणी निकाल</h3><ul className="review-list">{categories.map(key => <li key={key}>{documentCategories[key]} <span>{app.documents[key] ? verificationLabels[app.documents[key].verification] : "उपलब्ध नाही"}</span></li>)}</ul>
          <Button variant="outline" onClick={onViewDocuments}>कागदपत्रांच्या प्रती पहा</Button>
        </div>
        <div className="review-block"><h3>लक्ष देण्याच्या बाबी</h3>{incomplete.length ? <ul className="notice">{incomplete.map(item => <li key={item}>{item}</li>)}</ul> : <p className="muted">नोंदवलेली कोणतीही बाब बाकी नाही.</p>}</div>
        <div className="review-block"><h3>पूर्वीचे शेरे</h3>{app.history.some(entry => entry.remarks) ? <ul className="remarks-list">{app.history.filter(entry => entry.remarks).map(entry => <li key={entry.id}>{entry.remarks}</li>)}</ul> : <p className="muted">शेरे उपलब्ध नाहीत.</p>}</div>
      </>;
    }
  }
}
