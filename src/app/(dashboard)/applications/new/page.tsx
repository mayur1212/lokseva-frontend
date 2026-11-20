"use client";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { backend } from "@/services/api";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

export default function NewPage() {
  return <ProtectedPage><NewApplication /></ProtectedPage>;
}

function NewApplication() {
  const router = useRouter();
  return <>
    <div className="page-heading"><div><h1>नवीन अर्ज</h1></div></div>
    <ApplicationForm onSubmit={async (person, documents) => {
      const app = await backend.create(person, documents);
      toast.success("अर्ज यशस्वीरीत्या सादर झाला.");
      router.push(`/applications/${app.id}`);
    }} />
  </>;
}
