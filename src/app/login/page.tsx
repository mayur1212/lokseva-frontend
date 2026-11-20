"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/services/api";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { officer, signIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (officer) router.replace("/dashboard"); }, [officer, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      setError("वैध ई-मेल आणि संकेतशब्द भरा.");
      return;
    }
    setError("");
    setLoading(true);
    try { await signIn(email, password); router.replace("/dashboard"); }
    catch (cause) { setError(apiErrorMessage(cause, "लॉगिन करता आले नाही. पुन्हा प्रयत्न करा.")); }
    finally { setLoading(false); }
  }

  return <main className="login">
    <section className="login-hero">
      <Brand />
      <div className="login-intro"><ShieldCheck size={48} strokeWidth={1.3} /><h1>उत्पन्नाचा दाखला<br /> व्यवस्थापन प्रणाली</h1><p>अर्ज स्वीकारण्यापासून अंतिम निर्णयापर्यंतची प्रक्रिया एका ठिकाणी.</p></div>
      <div className="login-grid" aria-hidden="true" />
    </section>
    <section className="login-main">
      <div className="login-card">
        <span className="icon-tile blue"><LockKeyhole size={23} /></span>
        <h2>अधिकारी लॉगिन</h2>
        <p className="muted">अर्ज व्यवस्थापनासाठी आपल्या खात्यात प्रवेश करा.</p>
        <form onSubmit={submit} noValidate>
          <label>ई-मेल<div className="login-input"><Mail size={18} /><input name="email" type="email" autoComplete="username" placeholder="ई-मेल लिहा" required /></div></label>
          <label>संकेतशब्द<div className="login-input"><LockKeyhole size={18} /><input name="password" type={visible ? "text" : "password"} autoComplete="current-password" placeholder="संकेतशब्द लिहा" required />
            <Button variant="ghost" className="icon-button" aria-label={visible ? "संकेतशब्द लपवा" : "संकेतशब्द दाखवा"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</Button>
          </div></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "प्रवेश सुरू आहे…" : "लॉगिन करा"}</Button>
        </form>
      </div>
    </section>
  </main>;
}
