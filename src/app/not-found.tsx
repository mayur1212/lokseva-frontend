import Link from "next/link";
import { EmptyState } from "@/components/ui/Feedback";

export default function NotFound() {
  return <main className="content">
    <EmptyState title="पृष्ठ सापडले नाही" />
    <Link className="button button-outline back-link" href="/dashboard">मुख्य पृष्ठावर जा</Link>
  </main>;
}
