import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      } else {
        setResult("وقع مشكل: " + JSON.stringify(data.error));
      }
    } catch (err) {
      setResult("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Aivora Pro 🚀</h1>
      <textarea
        rows={4}
        style={{ width: "100%", marginBottom: 10 }}
        placeholder="كتب السؤال ديالك..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={generate}>
        {loading ? "جاري..." : "Generate"}
      </button>
      <div style={{ marginTop: 20 }}>
        <strong>الجواب:</strong>
        <p>{result}</p>
      </div>
    </div>
  );
}
