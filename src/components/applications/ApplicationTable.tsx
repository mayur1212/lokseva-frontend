import Link from "next/link";
import { Eye } from "lucide-react";
import type { Application } from "@/types/application";
import { stages } from "@/constants/statuses";
import { priorityInfo } from "@/services/applicationService";
import { ago, date, money, number } from "@/utils/format";
import { PriorityBadge, StatusBadge } from "./Badges";

type Mode = "recent" | "pending" | "all";

export function ApplicationTable({ applications, now, mode = "all" }: { applications: Application[]; now: number; mode?: Mode }) {
  return <div className="table-scroll">
    <table className="application-table">
      <thead><tr>
        <th scope="col">अर्ज क्रमांक</th><th scope="col">अर्जदाराचे नाव</th>
        {mode === "all" && <><th scope="col">तालुका</th><th scope="col">वार्षिक उत्पन्न</th></>}
        <th scope="col">{mode === "pending" ? "प्रलंबित कालावधी" : "अर्जाची तारीख"}</th><th scope="col">सध्याचा टप्पा</th>
        <th scope="col">स्थिती</th><th scope="col">प्राधान्य</th><th scope="col">अंतिम मुदत</th><th scope="col">कृती</th>
      </tr></thead>
      <tbody>{applications.map(app => {
        const priority = priorityInfo(app, now);
        return <tr key={app.id}>
          <td data-label="अर्ज क्रमांक" className="record-id">{app.id}</td><td data-label="अर्जदाराचे नाव" className="applicant">{app.name}</td>
          {mode === "all" && <><td data-label="तालुका">{app.taluka}</td><td data-label="वार्षिक उत्पन्न">{money(app.income)}</td></>}
          <td data-label={mode === "pending" ? "प्रलंबित कालावधी" : "अर्जाची तारीख"}>{mode === "pending" ? `${number(ago(app.submitted, now))} दिवस` : date(app.submitted)}</td>
          <td data-label="सध्याचा टप्पा">{stages[app.stage]}</td><td data-label="स्थिती"><StatusBadge status={app.status} /></td>
          <td data-label="प्राधान्य"><div><PriorityBadge priority={priority.value} />{mode === "pending" && <small className="reason">{priority.reason}</small>}</div></td>
          <td data-label="अंतिम मुदत">{date(app.deadline)}</td>
          <td data-label="कृती"><Link className="button button-outline table-action" href={`/applications/${app.id}`} aria-label={`${app.name} · ${mode === "pending" ? "पडताळणी सुरू ठेवा" : "अर्ज पहा"}`}><Eye size={15} />{mode === "pending" ? "पडताळणी सुरू ठेवा" : "अर्ज पहा"}</Link></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}
