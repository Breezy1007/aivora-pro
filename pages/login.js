import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handle = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("أدخل الإيميل وكلمة السر"); return; }
    setLoading(true);
    if (isSignup) {
      const { error: e } = await supabase.auth.signUp({ email, password });
      if (e) setError(e.message);
      else setSuccess("تم إنشاء الحساب! تحقق من إيميلك للتفعيل.");
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) setError("إيميل أو كلمة السر غلط");
      else router.push("/chat");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>NexusAI — {isSignup ? "إنشاء حساب" : "تسجيل الدخول"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div className="root">
        <div className="ambient" />
        <div className="ambient2" />
        <div className="card">
          <div className="logo">
            <div className="logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#g1)" />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-name">NexusAI</span>
          </div>

          <h1 className="title">{isSignup ? "إنشاء حساب جديد" : "مرحباً بعودتك"}</h1>
          <p className="sub">{isSignup ? "ابدأ مجاناً اليوم" : "سجل دخولك للمتابعة"}</p>

          <div className="form">
            <div className="field">
              <label>الإيميل</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                dir="ltr"
              />
            </div>
            <div className="field">
              <label>كلمة السر</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                dir="ltr"
              />
            </div>

            {error && <div className="error">⚠️ {error}</div>}
            {success && <div className="success">✅ {success}</div>}

            <button className="btn" onClick={handle} disabled={loading}>
              {loading ? <span className="spin" /> : (isSignup ? "إنشاء الحساب" : "تسجيل الدخول")}
            </button>
          </div>

          <p className="switch">
            {isSignup ? "عندك حساب؟" : "ما عندكش حساب؟"}
            <button className="switch-btn" onClick={() => { setIsSignup(!isSignup); setError(""); setSuccess(""); }}>
              {isSignup ? "سجل دخولك" : "إنشاء حساب مجاني"}
            </button>
          </p>
        </div>
      </div>

      <style jsx global>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg: #07070d; --surface: #12121e; --border: rgba(255,255,255,0.08);
          --border2: rgba(255,255,255,0.13); --cyan: #00e5ff; --purple: #7c3aed;
          --text: #e8e8f0; --muted: #6a6a82;
        }
        html, body { height: 100%; }
        body { background: var(--bg); color: var(--text); font-family: "Outfit", sans-serif; }
        .root { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden; }
        .ambient { position: fixed; top: -200px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%); pointer-events: none; }
        .ambient2 { position: fixed; bottom: -150px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 65%); pointer-events: none; }
        .card { position: relative; z-index: 10; width: 100%; max-width: 420px; background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 40px 36px; }
        .logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 28px; }
        .logo-mark { width: 38px; height: 38px; background: linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.12)); border: 1px solid rgba(0,229,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .logo-name { font-size: 22px; font-weight: 700; background: linear-gradient(135deg, var(--cyan), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .title { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 6px; }
        .sub { font-size: 14px; color: var(--muted); text-align: center; margin-bottom: 28px; }
        .form { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 7px; }
        .field label { font-size: 13px; font-weight: 600; color: var(--muted); }
        .field input { background: rgba(255,255,255,0.04); border: 1px solid var(--border2); border-radius: 12px; padding: 12px 16px; color: var(--text); font-family: "Outfit", sans-serif; font-size: 15px; outline: none; transition: border-color 0.2s; }
        .field input:focus { border-color: rgba(0,229,255,0.3); }
        .field input::placeholder { color: var(--muted); }
        .error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #f87171; }
        .success { background: rgba(0,229,160,0.1); border: 1px solid rgba(0,229,160,0.2); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #34d399; }
        .btn { margin-top: 4px; width: 100%; padding: 14px; background: linear-gradient(135deg, var(--cyan), var(--purple)); border: none; border-radius: 12px; color: white; font-family: "Outfit", sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; min-height: 50px; }
        .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,229,255,0.2); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spin { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .switch { text-align: center; font-size: 13px; color: var(--muted); margin-top: 20px; }
        .switch-btn { background: none; border: none; color: var(--cyan); font-family: "Outfit", sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; margin-right: 5px; }
        .switch-btn:hover { text-decoration: underline; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
