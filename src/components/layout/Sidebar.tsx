"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { navigation } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Brand } from "./Brand";

export function Sidebar({ active, open, onClose, onLogout }: { active: string; open: boolean; onClose: () => void; onLogout: () => void }) {
  return <>
    {open && <button className="scrim" onClick={onClose} aria-label="मेनू बंद करा" />}
    <aside className={`sidebar ${open ? "drawer-open" : ""}`} id="sidebar">
      <div className="sidebar-brand"><Brand /><Button className="drawer-close icon-button" variant="ghost" onClick={onClose} aria-label="मेनू बंद करा"><X size={20} /></Button></div>
      <nav aria-label="मुख्य मेनू">
        {navigation.map(({ href, label, icon: Icon }) => <Link className={active === href ? "nav-active" : ""} aria-current={active === href ? "page" : undefined} key={href} href={href} onClick={onClose} title={label}><Icon size={19} /><span>{label}</span></Link>)}
      </nav>
      <div className="sidebar-bottom">
        <Button variant="ghost" onClick={onLogout} title="बाहेर पडा"><LogOut size={18} /><span>बाहेर पडा</span></Button>
      </div>
    </aside>
  </>;
}
