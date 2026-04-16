import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const SUGGESTIONS = [
  "اكتب لي بوست إنستغرام لمتجر ملابس",
  "ساعدني نكتب إيميل ماركيتينغ",
  "شنو أحسن استراتيجية للتسويق؟",
  "Help me write a product description",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      <div className={`avatar ${isUser ? "user-avatar" : "ai-avatar"}`}>
        {isUser ? "👤" : "⚡"}
      </div>
      <div className={`bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
        <div className="bubble-text" dir="auto">
          {msg.content}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg-row ai">
      <div className="avatar ai-avatar">⚡</div>
      <div className="bubble ai-bubble typing">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.result) {
        setMessages([...newMessages, { role: "assistant", content: data.result }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "وقع خطأ، حاول مجدداً." }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "مشكل في الاتصال." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <>
      <Head>
        <title>NexusAI Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">NexusAI</span>
          </div>

          <button className="new-chat-btn" onClick={clearChat}>
            <span>+</span> محادثة جديدة
          </button>

          <div className="sidebar-section">
            <p className="sidebar-label">اقتراحات</p>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="suggestion-item" onClick={() => send(s)}>
                <span className="suggestion-icon">💬</span>
                <span className="suggestion-text">{s}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="plan-badge">
              <span>⚡</span> الخطة المجانية
            </div>
          </div>
        </aside>

        {/* Main Chat */}
        <main className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <span className="model-badge">llama-3.3-70b</span>
            </div>
            <button className="clear-btn" onClick={clearChat}>
              محادثة جديدة ✦
            </button>
          </div>

          {/* Messages */}
          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⚡</div>
                <h2 className="empty-title">كيف يمكنني مساعدتك؟</h2>
                <p className="empty-sub">اسألني أي شيء — تسويق، بيزنيس، أو أي موضوع آخر</p>
                <div className="quick-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="quick-btn" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}

            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-box">
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="اكتب رسالتك هنا..."
                value={input}
                onChange={handleInput}
                onKeyDown={handleKey}
                rows={1}
                dir="auto"
              />
              <button
                className={`send-btn ${(!input.trim() || loading) ? "disabled" : ""}`}
                onClick={() => send()}
                disabled={!input.trim() || loading}
              >
                {loading ? <span className="send-spinner" /> : "↑"}
              </button>
            </div>
            <p className="input-hint">Enter للإرسال • Shift+Enter لسطر جديد</p>
          </div>
        </main>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: #0a0a0f;
          --sidebar: #0f0f17;
          --surface: #16161f;
          --border: rgba(255,255,255,0.07);
          --accent: #00e5ff;
          --accent2: #7c3aed;
          --text: #ececf1;
          --muted: #56566b;
          --user-bg: #1e1e2e;
          --ai-bg: transparent;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: "Plus Jakarta Sans", sans-serif;
          height: 100vh;
          overflow: hidden;
        }

        .layout {
          display: flex;
          height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: var(--sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 20px 14px;
          flex-shrink: 0;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px 20px;
        }

        .logo-icon { font-size: 22px; }

        .logo-text {
          font-family: "Syne", sans-serif;
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .new-chat-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.2);
          border-radius: 10px;
          color: var(--accent);
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 24px;
        }

        .new-chat-btn:hover {
          background: rgba(0,229,255,0.14);
        }

        .sidebar-section { flex: 1; }

        .sidebar-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
          margin-bottom: 8px;
          padding: 0 8px;
        }

        .suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          width: 100%;
          padding: 9px 10px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--muted);
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 13px;
          text-align: right;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 2px;
        }

        .suggestion-item:hover {
          background: rgba(255,255,255,0.04);
          color: var(--text);
        }

        .suggestion-icon { flex-shrink: 0; font-size: 14px; }
        .suggestion-text { flex: 1; line-height: 1.4; }

        .sidebar-footer { margin-top: auto; padding-top: 16px; }

        .plan-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 8px;
          font-size: 13px;
          color: #a78bfa;
        }

        /* Main */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: var(--bg);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 24px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .model-badge {
          font-size: 12px;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .clear-btn {
          font-size: 13px;
          color: var(--muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          font-family: "Plus Jakarta Sans", sans-serif;
        }

        .clear-btn:hover { color: var(--text); }

        /* Messages */
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          scroll-behavior: smooth;
        }

        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-track { background: transparent; }
        .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
          text-align: center;
          animation: fadeUp 0.5s ease both;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          filter: drop-shadow(0 0 20px rgba(0,229,255,0.4));
        }

        .empty-title {
          font-family: "Syne", sans-serif;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .empty-sub {
          color: var(--muted);
          font-size: 15px;
          margin-bottom: 32px;
        }

        .quick-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          max-width: 600px;
        }

        .quick-btn {
          padding: 10px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text);
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-btn:hover {
          border-color: rgba(0,229,255,0.3);
          background: rgba(0,229,255,0.05);
          color: var(--accent);
        }

        /* Message rows */
        .msg-row {
          display: flex;
          gap: 14px;
          margin-bottom: 24px;
          animation: fadeUp 0.3s ease both;
          max-width: 820px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
        }

        .msg-row.user { flex-direction: row-reverse; }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .ai-avatar {
          background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15));
          border: 1px solid rgba(0,229,255,0.2);
        }

        .user-avatar {
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .bubble {
          max-width: 75%;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 15px;
          line-height: 1.7;
        }

        .ai-bubble {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px 16px 16px 16px;
        }

        .user-bubble {
          background: var(--user-bg);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 16px 4px 16px 16px;
        }

        .bubble-text {
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* Typing */
        .typing {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 16px 20px;
        }

        .dot {
          width: 7px;
          height: 7px;
          background: var(--muted);
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        /* Input area */
        .input-area {
          padding: 16px 24px 20px;
          flex-shrink: 0;
        }

        .input-box {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 10px 10px 10px 16px;
          transition: border-color 0.2s;
          max-width: 820px;
          margin: 0 auto;
        }

        .input-box:focus-within {
          border-color: rgba(0,229,255,0.3);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 15px;
          resize: none;
          max-height: 160px;
          line-height: 1.6;
          padding: 4px 0;
        }

        .chat-input::placeholder { color: var(--muted); }

        .send-btn {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .send-btn:hover:not(.disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,229,255,0.3);
        }

        .send-btn.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .send-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .input-hint {
          font-size: 11px;
          color: var(--muted);
          text-align: center;
          margin-top: 8px;
          max-width: 820px;
          margin-left: auto;
          margin-right: auto;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .sidebar { display: none; }
          .messages { padding: 16px; }
          .input-area { padding: 12px 16px 16px; }
          .bubble { max-width: 90%; }
        }
      `}</style>
    </>
  );
}
