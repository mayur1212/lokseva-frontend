"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiErrorMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { navigation } from "@/constants/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Shell({ children }: { children: ReactNode }) {
  const { officer, ready, signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (ready && !officer) router.replace("/login");
  }, [officer, ready, router]);
  useEffect(() => {
    const query = matchMedia("(max-width: 760px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!drawer) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawer(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [drawer]);
  const current = navigation.find(item => item.href === path);
  const logout = async () => {
    try { await signOut(); router.replace("/login"); }
    catch (cause) { toast.error(apiErrorMessage(cause, "खात्यातून बाहेर पडता आले नाही. पुन्हा प्रयत्न करा.")); }
  };
  return <div className={officer ? `shell ${collapsed ? "sidebar-collapsed" : ""}` : undefined}>
    {officer && <Sidebar active={current?.href ?? "/applications"} open={drawer} onClose={() => setDrawer(false)} onLogout={logout} />}
    <div className="workspace">
      {officer && <Header title={current?.label ?? "अर्जाचा तपशील"} officer={officer} expanded={mobile ? drawer : !collapsed}
        onToggle={() => mobile ? setDrawer(!drawer) : setCollapsed(!collapsed)} onLogout={logout} />}
      <main className="content">{children}</main>
    </div>
  </div>;
}
