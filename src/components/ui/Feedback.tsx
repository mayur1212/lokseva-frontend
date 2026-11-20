import { Inbox, TriangleAlert } from "lucide-react";

export function EmptyState({ title = "कोणताही अर्ज सापडला नाही", description, error = false }: { title?: string; description?: string; error?: boolean }) {
  const Icon = error ? TriangleAlert : Inbox;
  return <div className="panel empty" role={error ? "alert" : "status"}><Icon size={29} /><strong>{title}</strong>{description && <p>{description}</p>}</div>;
}
export function LoadingSkeleton() {
  return <div className="panel skeleton" role="status" aria-label="माहिती लोड होत आहे" aria-busy="true">
    <span /><span /><span />
  </div>;
}
export function DataError() {
  return <EmptyState error title="अर्ज लोड करता आले नाहीत" description="सर्व्हरशी जोडणी तपासा आणि पृष्ठ पुन्हा उघडा." />;
}
