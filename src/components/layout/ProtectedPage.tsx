"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/Feedback";

export function ProtectedPage({ children }: { children: ReactNode }) {
  const { ready, officer } = useAuth();
  return ready && officer ? children : <LoadingSkeleton />;
}
