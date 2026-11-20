"use client";

import { useEffect, useState } from "react";

export function useBackendData<T>(load: (signal: AbortSignal) => Promise<T>, revision = 0) {
  const [result, setResult] = useState<{ load: typeof load; revision: number; data?: T; error?: unknown }>();

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ load, revision, data });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ load, revision, error });
    });
    return () => controller.abort();
  }, [load, revision]);

  return result?.load === load && result.revision === revision ? result : undefined;
}
