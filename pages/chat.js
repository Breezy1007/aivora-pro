import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SUGGESTIONS = [
  { icon: "🚀", text: "اكتب لي بوست إنستغرام احترافي" },
  { icon: "💡", text: "ساعدني نبني استراتيجية تسويق" },
  { icon: "🧠", text: "اشرح لي الذكاء الاصطناعي ببساطة" },
  { icon: "💻", text: "ساعدني في كود Python" },
];

const FREE_LIMIT = 10;

function Message({ msg, isNew }) {
  const isUser = msg.role === "user";
  return (
    <div className={`msg ${isUser ? "msg-user" : "msg-ai"} ${isNew ? "msg-new" : ""}`}>
      {!isUser && (
        <div className="ai-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#bolt)" />
            <defs><linearGradient id="bolt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00e5ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
          </svg>
        </div>
      )}
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
        <p dir="auto">{msg.content}</p>
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="msg msg-ai">
      <div className="ai-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#bolt2)" />
          <defs><linearGradient id="bolt2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00e5ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
        </svg>
      </div>
      <div className="bubble bubble-ai typing-bubble">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMsgIdx, setNewMsgIdx] = useState(null);
  const [user, setUser] = useState(null);
  const [msgCount, setMsgCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const bottomRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else {
        setUser(data.user);
        const count = parseInt(localStorage.getItem(`msg_count_${data.user.id}`) || "0");
        setMsgCount(count);
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    if (msgCount >= FREE_LIMIT) { setShowUpgrade(true); return; }

    setInput("");
    const userMsg = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    setNewMsgIdx(null);

    const newCount = msgCount + 1;
    setMsgCount(newCount);
    if (user) localStorage.setItem(`msg_count_${user.id}`, newCount);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.result || "وقع خطأ." }]);
      setNewMsgIdx(updated.length);
    } catch {
      setMessages([...updated, { role: "assistant", content: "مشكل في الاتصال." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const remaining = FREE_LIMIT - msgCount;

  return (
    <>
      <Head>
        <title>NexusAI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="root">
        <div className="ambient" />
        <div className="ambient2" />

        {showUpgrade && (
          <div className="modal-overlay" onClick={() => setShowUpgrade(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">⚡</div>
              <h2>وصلتي للحد المجاني</h2>
              <p>استعملتي {FREE_LIMIT} رسائل مجانية. Upgrade باش تواصل!</p>
              <div className="plans">
                <div className="plan">
                  <p className="plan-name">Starter</p>
                  <p className="plan-price">49 درهم<span>/شهر</span></p>
                  <p className="plan-desc">200 رسالة في الشهر</p>
                  <button className="plan-btn">اختار</button>
                </div>
                <div className="plan plan-featured">
                  <p className="plan-badge">الأشهر</p>
                  <p className="plan-name">Pro</p>
                  <p className="plan-price">149 درهم<span>/شهر</span></p>
                  <p className="plan-desc">رسائل غير محدودة</p>
                  <button className="plan-btn plan-btn-featured">اختار</button>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowUpgrade(false)}>إغلاق</button>
            </div>
          </div>
        )}

        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#g1)" />
                <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00e5ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
              </svg>
            </div>
            <span className="logo-name">NexusAI</span>
          </div>

          <button className="new-btn" onClick={() => { setMessages([]); setInput(""); }}>
            <span>+</span> محادثة جديدة
          </button>

          <div className="sidebar-section">
            <p className="section-title">اقتراحات</p>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="sugg-btn" onClick={() => send(s.text)}>
                <span>{s.icon}</span>
                <span>{s.text}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-bottom">
            <div className="usage-bar">
              <div className="usage-top">
                <span className="usage-label">الرسائل المتبقية</span>
                <span className="usage-count">{Math.max(0, remaining)}/{FREE_LIMIT}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.max(0, remaining / FREE_LIMIT * 100)}%` }} />
              </div>
            </div>
            <button className="upgrade-full-btn" onClick={() => setShowUpgrade(true)}>
              ⚡ Upgrade للـ Pro
            </button>
            <button className="logout-btn" onClick={logout}>تسجيل الخروج</button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="model-pill">
              <span className="model-dot" />
              llama-3.3-70b
            </div>
            <div className="topbar-right">
              <span className="user-email">{user?.email}</span>
              <button className="topbar-btn" onClick={() => { setMessages([]); setInput(""); }}>محادثة جديدة</button>
            </div>
          </div>

          <div className="msgs-wrap">
            {messages.length === 0 ? (
              <div className="welcome">
                <div className="welcome-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#wg)" />
                    <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00e5ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
                  </svg>
                </div>
                <h1 className="welcome-title">مرحباً، كيف يمكنني مساعدتك؟</h1>
                <p className="welcome-sub">اسألني أي شيء — تسويق، كود، علم، أو أي موضوع</p>
                <div className="welcome-cards">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="welcome-card" onClick={() => send(s.text)}>
                      <span className="welcome-card-icon">{s.icon}</span>
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="msgs">
                {messages.map((m, i) => <Message key={i} msg={m} isNew={i === newMsgIdx} />)}
                {loading && <Typing />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="input-zone">
            {remaining <= 3 && remaining > 0 && (
              <p className="warning">⚠️ باقيك {remaining} رسائل مجانية فقط</p>
            )}
            <div className="input-shell">
              <textarea
                className="input-field"
                placeholder="اكتب رسالتك..."
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
                }}
                onKeyDown={handleKey}
                rows={1}
                dir="auto"
                disabled={msgCount >= FREE_LIMIT}
              />
              <button
                className={`send ${input.trim() && !loading && msgCount < FREE_LIMIT ? "send-active" : ""}`}
                onClick={() => send()}
                disabled={!input.trim() || loading || msgCount >= FREE_LIMIT}
              >
                {loading
                  ? <span className="send-spin" />
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                }
              </button>
            </div>
            <p className="input-note">Enter للإرسال · Shift+Enter لسطر جديد</p>
          </div>
        </main>
      </div>

      <style jsx global>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --bg: #07070d; --sb: #0c0c15; --surface: #12121e; --surface2: #1a1a28; --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12); --cyan: #00e5ff; --purple: #7c3aed; --text: #e8e8f0; --muted: #5a5a72; --muted2: #8888a0; }
        html, body { height: 100%; overflow: hidden; }
        body { background: var(--bg); color: var(--text); font-family: "Outfit", sans-serif; }
        .root { display: flex; height: 100vh; position: relative; overflow: hidden; }
        .ambient { position: fixed; top: -300px; left: -200px; width: 700px; height: 700px; background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%); pointer-events: none; z-index: 0; }
        .ambient2 { position: fixed; bottom: -200px; right: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 65%); pointer-events: none; z-index: 0; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 24px; padding: 36px 32px; max-width: 420px; width: 100%; text-align: center; }
        .modal-icon { font-size: 40px; margin-bottom: 16px; }
        .modal h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .modal p { color: var(--muted2); font-size: 14px; margin-bottom: 28px; }
        .plans { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .plan { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 20px 16px; position: relative; }
        .plan-featured { border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.05); }
        .plan-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--cyan), var(--purple)); color: white; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 10px; white-space: nowrap; }
        .plan-name { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
        .plan-price { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .plan-price span { font-size: 12px; font-weight: 400; color: var(--muted2); }
        .plan-desc { font-size: 12px; color: var(--muted2); margin-bottom: 14px; }
        .plan-btn { width: 100%; padding: 8px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: "Outfit", sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
        .plan-btn-featured { background: linear-gradient(135deg, var(--cyan), var(--purple)); border-color: transparent; color: white; }
        .modal-close { background: none; border: none; color: var(--muted); font-family: "Outfit", sans-serif; font-size: 13px; cursor: pointer; }
        .sidebar { width: 255px; flex-shrink: 0; background: var(--sb); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 18px 12px; position: relative; z-index: 10; }
        .logo { display: flex; align-items: center; gap: 10px; padding: 2px 8px 22px; }
        .logo-mark { width: 34px; height: 34px; background: linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.12)); border: 1px solid rgba(0,229,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .logo-name { font-size: 19px; font-weight: 700; background: linear-gradient(135deg, var(--cyan), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .new-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; background: linear-gradient(135deg, rgba(0,229,255,0.08), rgba(124,58,237,0.08)); border: 1px solid rgba(0,229,255,0.15); border-radius: 12px; color: var(--cyan); font-family: "Outfit", sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 22px; transition: all 0.2s; }
        .new-btn:hover { background: linear-gradient(135deg, rgba(0,229,255,0.14), rgba(124,58,237,0.14)); }
        .sidebar-section { flex: 1; }
        .section-title { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); padding: 0 8px; margin-bottom: 8px; }
        .sugg-btn { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 9px 10px; background: none; border: none; border-radius: 10px; color: var(--muted2); font-family: "Outfit", sans-serif; font-size: 13px; text-align: right; cursor: pointer; margin-bottom: 2px; transition: all 0.15s; line-height: 1.4; }
        .sugg-btn:hover { background: rgba(255,255,255,0.04); color: var(--text); }
        .sidebar-bottom { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
        .usage-bar { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px; }
        .usage-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .usage-label { font-size: 12px; color: var(--muted2); }
        .usage-count { font-size: 12px; font-weight: 600; color: var(--cyan); }
        .bar-track { height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
        .bar-fill { height: 100%; background: linear-gradient(90deg, var(--cyan), var(--purple)); border-radius: 2px; transition: width 0.3s; }
        .upgrade-full-btn { width: 100%; padding: 11px; background: linear-gradient(135deg, var(--cyan), var(--purple)); border: none; border-radius: 10px; color: white; font-family: "Outfit", sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .upgrade-full-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,229,255,0.2); }
        .logout-btn { width: 100%; padding: 9px; background: none; border: 1px solid var(--border); border-radius: 10px; color: var(--muted); font-family: "Outfit", sans-serif; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .logout-btn:hover { color: var(--text); border-color: var(--border2); }
        .main { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; z-index: 10; }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .model-pill { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted2); background: var(--surface); border: 1px solid var(--border); padding: 5px 12px; border-radius: 20px; }
        .model-dot { width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; box-shadow: 0 0 5px var(--cyan); }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .user-email { font-size: 12px; color: var(--muted); }
        .topbar-btn { font-size: 12px; color: var(--muted); background: none; border: none; cursor: pointer; font-family: "Outfit", sans-serif; }
        .msgs-wrap { flex: 1; overflow-y: auto; overflow-x: hidden; }
        .msgs-wrap::-webkit-scrollbar { width: 3px; }
        .msgs-wrap::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
        .welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; padding: 40px 24px; text-align: center; }
        .welcome-icon { width: 72px; height: 72px; background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(124,58,237,0.1)); border: 1px solid rgba(0,229,255,0.15); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
        .welcome-title { font-size: clamp(22px, 4vw, 32px); font-weight: 700; margin-bottom: 10px; }
        .welcome-sub { font-size: 15px; color: var(--muted2); margin-bottom: 36px; }
        .welcome-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-width: 560px; width: 100%; }
        .welcome-card { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; color: var(--muted2); font-family: "Outfit", sans-serif; font-size: 13px; text-align: right; cursor: pointer; transition: all 0.2s; line-height: 1.4; }
        .welcome-card:hover { background: var(--surface2); border-color: rgba(0,229,255,0.2); color: var(--text); transform: translateY(-2px); }
        .welcome-card-icon { font-size: 18px; flex-shrink: 0; }
        .msgs { padding: 28px 24px; max-width: 860px; margin: 0 auto; width: 100%; }
        .msg { display: flex; gap: 12px; margin-bottom: 20px; }
        .msg-user { flex-direction: row-reverse; }
        .msg-new .bubble-ai { animation: msgIn 0.35s ease both; }
        .ai-badge { width: 32px; height: 32px; flex-shrink: 0; background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(124,58,237,0.1)); border: 1px solid rgba(0,229,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
        .bubble { max-width: 72%; padding: 13px 17px; border-radius: 16px; font-size: 15px; line-height: 1.75; }
        .bubble p { white-space: pre-wrap; word-break: break-word; }
        .bubble-ai { background: var(--surface); border: 1px solid var(--border); border-top-left-radius: 4px; }
        .bubble-user { background: linear-gradient(135deg, rgba(0,229,255,0.1), rgba(124,58,237,0.1)); border: 1px solid rgba(124,58,237,0.2); border-top-right-radius: 4px; }
        .typing-bubble { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
        .dot { width: 6px; height: 6px; background: var(--muted); border-radius: 50%; animation: blink 1.3s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        .input-zone { padding: 14px 24px 20px; flex-shrink: 0; }
        .warning { text-align: center; font-size: 12px; color: #f59e0b; margin-bottom: 8px; }
        .input-shell { display: flex; align-items: flex-end; gap: 10px; background: var(--surface); border: 1px solid var(--border2); border-radius: 18px; padding: 10px 10px 10px 18px; max-width: 860px; margin: 0 auto; transition: border-color 0.2s; }
        .input-shell:focus-within { border-color: rgba(0,229,255,0.25); }
        .input-field { flex: 1; background: transparent; border: none; outline: none; color: var(--text); font-family: "Outfit", sans-serif; font-size: 15px; resize: none; max-height: 150px; line-height: 1.6; padding: 3px 0; }
        .input-field::placeholder { color: var(--muted); }
        .input-field:disabled { opacity: 0.4; cursor: not-allowed; }
        .send { width: 38px; height: 38px; flex-shrink: 0; background: var(--surface2); border: 1px solid var(--border2); border-radius: 12px; color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .send-active { background: linear-gradient(135deg, var(--cyan), var(--purple)); border-color: transparent; color: white; box-shadow: 0 4px 16px rgba(0,229,255,0.2); }
        .send-active:hover { transform: scale(1.05); }
        .send:disabled { cursor: not-allowed; opacity: 0.4; }
        .send-spin { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.25); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .input-note { font-size: 11px; color: var(--muted); text-align: center; margin-top: 8px; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-5px); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .sidebar { display: none; } .msgs { padding: 16px; } .input-zone { padding: 10px 14px 16px; } .welcome-cards { grid-template-columns: 1fr; } .bubble { max-width: 88%; } .user-email { display: none; } }
      `}</style>
    </>
  );
}
