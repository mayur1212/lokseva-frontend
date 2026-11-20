import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { ApplicationList } from "@/components/applications/ApplicationList";
export default function Page() { return <ProtectedPage><ApplicationList pending /></ProtectedPage>; }
