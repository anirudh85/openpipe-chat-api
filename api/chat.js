export default async function handler(req, res) {
  const userMessage = req.body.message;

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
  res.status(200).json({ reply: data.choices[0].message.content });
}
