import { Check } from "lucide-react";
import { stages } from "@/constants/statuses";
import type { Stage } from "@/types/workflow";
import { number } from "@/utils/format";

export function ApplicationStepper({ stage, selected, closed, documentChecklist, onSelect }: { stage: Stage; selected: Stage; closed: boolean; documentChecklist: boolean; onSelect: (stage: Stage) => void }) {
  return <ol className="panel stepper" aria-label="अर्जाचे टप्पे">{stages.map((label, index) => {
    const deferred = index === 1 && index < stage && !documentChecklist;
    const complete = !deferred && (index < stage || closed);
    return <li key={label} className={selected === index ? "selected-step" : ""}>
      <button type="button" disabled={index > stage} aria-current={index === selected ? "step" : undefined} onClick={() => onSelect(index as Stage)}>
        <span className={`step-index ${complete ? "step-complete" : ""}`}>{complete ? <Check size={17} /> : number(index + 1)}</span>
        <span><strong>{label}</strong><small>{complete ? "पूर्ण" : deferred ? "अपूर्ण" : index === stage ? "सध्याचा टप्पा" : "बाकी"}</small></span>
      </button>
    </li>;
  })}</ol>;
}
