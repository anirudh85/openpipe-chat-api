export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const userMessage = req.body?.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  // ✅ Hardcoded for debugging
  const API_KEY = "opk_745a203d5250b3afb54f39976a6bcce1a3ecca1384"; // ← Your actual OpenPipe API key
  const MODEL_ID = "openpipe:polite-geckos-mindspace";

  try {
    const response = await fetch("https://api.openpipe.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const text = await response.text();
    console.log("OpenPipe raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON response from OpenPipe", raw: text });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(200).json({ reply: "" });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("OpenPipe error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
