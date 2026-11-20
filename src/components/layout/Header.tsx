"use client";

import { ChevronDown, LogOut, PanelLeft } from "lucide-react";
import type { Officer } from "@/types/auth";
import { Button } from "@/components/ui/button";

export function Header({ title, officer, expanded, onToggle, onLogout }: { title: string; officer: Officer; expanded: boolean; onToggle: () => void; onLogout: () => void }) {
  return <header className="header">
    <div className="header-title"><Button variant="ghost" className="icon-button" aria-label="मेनू दाखवा किंवा लपवा" aria-controls="sidebar" aria-expanded={expanded} onClick={onToggle}><PanelLeft size={20} /></Button><span>{title}</span></div>
    <details className="profile">
      <summary><span className="avatar">{officer.name.slice(0, 1)}</span><span className="profile-name"><strong>{officer.name}</strong><small>{officer.designation}</small></span><ChevronDown size={15} /></summary>
      <div className="profile-menu"><Button variant="ghost" onClick={onLogout}><LogOut size={17} /> बाहेर पडा</Button></div>
    </details>
  </header>;
}
