import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cms, useCms } from "@/lib/cms";
import { Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin Login — Yadhra Closet CMS" }] }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const isAdmin  = useCms((s) => s.isAdmin);
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  useEffect(() => {
    if (isAdmin) navigate({ to: "/admin" });
  }, [isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) {
      setErr("Email and password are required.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const ok = await cms.login(email.trim(), pass);
      if (ok) {
        navigate({ to: "/admin" });
      } else {
        setErr("Invalid credentials. Please try again.");
      }
    } catch {
      setErr("Login failed. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-bg px-5">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-[12px] font-semibold text-text-muted hover:text-deep-blue mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to site
        </Link>
        <div className="bg-white rounded-[20px] border border-border-grey shadow-xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-11 h-11 rounded-xl bg-deep-blue text-white font-serif text-lg font-semibold flex items-center justify-center">YC</span>
            <div>
              <h1 className="font-serif text-2xl text-deep-blue leading-none">Yadhra <em className="italic font-light">Closet</em></h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted mt-1">CMS Admin</p>
            </div>
          </div>
          <h2 className="font-serif text-3xl text-deep-blue">Sign in</h2>
          <p className="text-[13px] text-text-muted mt-1">Manage your store's content.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent-blue">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yadhra.com"
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border-grey bg-secondary-bg focus:border-deep-blue focus:bg-white outline-none text-[13px]"
                autoComplete="email"
                autoFocus
                disabled={busy}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent-blue">Password</label>
              <input
                id="admin-password"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border-grey bg-secondary-bg focus:border-deep-blue focus:bg-white outline-none text-[13px]"
                autoComplete="current-password"
                disabled={busy}
              />
            </div>
            {err && <p className="text-[12px] text-sale">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] bg-deep-blue text-white text-[13px] font-bold tracking-wide hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <><Lock className="w-3.5 h-3.5" /> Sign In to CMS</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
