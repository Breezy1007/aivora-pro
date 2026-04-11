import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const generate = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>🚀 Aivora AI</h1>

      <textarea
        placeholder="دخل فكرة..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "100%", height: 100 }}
      />

      <button onClick={generate} style={{ marginTop: 10 }}>
        Generate
      </button>

      <div style={{ marginTop: 20 }}>
        {result}
      </div>
    </div>
  );
}
