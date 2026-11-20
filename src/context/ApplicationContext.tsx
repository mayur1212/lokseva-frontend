"use client";

import { backend } from "@/services/api";
import { useBackendData } from "@/hooks/useBackendData";

export function useApplications() {
  const result = useBackendData(backend.list);
  return { applications: result?.data, error: result?.error };
}
