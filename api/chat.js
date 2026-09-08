export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: 'Please provide a question.' });
  }

  // Pulls the key from the Vercel Environment Variables you set up earlier
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing on the Vercel server.' });
  }

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: "You are StudyMate AI, an encouraging and expert academic tutor for students. Explain the topic clearly and concisely. Always structure your answer with: 1) A clear explanation paragraph, followed by 2) A 'Key Points:' heading with 3 to 4 concise bullet points summarizing essential exam takeaways."
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.6
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({ 
        error: data.error?.message || "Error from Groq API" 
      });
    }

    return res.status(200).json({ answer: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error connecting to AI." });
  }
}
