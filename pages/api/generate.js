export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, type } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  const systemPrompt = `You are NexusAI, a world-class marketing and business content generator. 
You create compelling, professional content in the same language as the user's request (Arabic or English).
When generating content, make it engaging, creative, and tailored for business success.
Format your response clearly with sections if generating multiple content types.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const result = data?.choices?.[0]?.message?.content || "No response generated";
    return res.status(200).json({ result });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
