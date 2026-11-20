import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { LoadingSkeleton } from "@/components/ui/Feedback";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="content"><LoadingSkeleton /></main>}>
    <Shell>{children}</Shell>
  </Suspense>;
}
