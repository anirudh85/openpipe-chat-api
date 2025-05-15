export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // ✅ Enable CORS
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

  // 🔍 Log env variables and request data
  console.log("Model ID:", process.env.MODEL_ID);
  console.log("API Key exists:", !!process.env.OPENPIPE_API_KEY);
  console.log("User message:", userMessage);

  try {
    const response = await fetch("https://openpipe.chat/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENPIPE_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL_ID,
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

    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: "Unexpected OpenPipe response", raw: data });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error("OpenPipe error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
