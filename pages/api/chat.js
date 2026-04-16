export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "No messages provided" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are NexusAI, an extremely intelligent AI assistant similar to Claude and ChatGPT.
You can help with absolutely anything: coding, math, science, writing, analysis, creative work, business, philosophy, history, and more.
You think deeply and provide thorough, accurate, and nuanced responses.
You respond in the same language the user writes in — Arabic, English, French, or any other language.
You are honest, curious, and genuinely helpful. You never refuse reasonable requests.
When answering complex questions, you break them down clearly and logically.
You have a warm, engaging personality and make conversations enjoyable.`,
          },
          ...messages,
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const result = data?.choices?.[0]?.message?.content || "No response";
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
