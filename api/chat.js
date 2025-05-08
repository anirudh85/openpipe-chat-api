export default async function handler(req, res) {
  const userMessage = req.body.message;

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

    // Check for OpenPipe API error
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("OpenPipe API returned unexpected format:", data);
      return res.status(500).json({ error: "Unexpected response from AI." });
    }

    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error("Error calling OpenPipe:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
