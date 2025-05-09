export const config = {
  api: {
    bodyParser: true, // Enable automatic JSON body parsing
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const userMessage = req.body?.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  try {
    const response = await fetch("https://api.openpipe.ai/v1/chat/completions", {
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

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({
        error: "Unexpected OpenPipe response",
        raw: data
      });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error("OpenPipe error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
