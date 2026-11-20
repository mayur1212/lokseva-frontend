"use client";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { useParams } from "next/navigation";
import { ApplicationDetails } from "@/components/workflow/ApplicationDetails";

export default function Page() {
  return <ProtectedPage><Application /></ProtectedPage>;
}

function Application() {
  const { id } = useParams<{ id: string }>();
  return <ApplicationDetails id={id} />;
}
