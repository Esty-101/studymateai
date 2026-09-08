const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 8000;
const GROQ_API_KEY = "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";

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Available candidate models for Groq API
const CANDIDATE_MODELS = [
  "groq/compound-mini",
  "groq/compound",
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b"
];

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, '') || '/';

  // Handle Groq AI Proxy Endpoint
  if (req.method === 'POST' && (pathname === '/api/chat' || pathname === '/api/chat/')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const question = payload.question;

        if (!question) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Please provide a question." }));
          return;
        }

        let groqResponse = null;
        let data = null;
        let lastError = null;

        // Try candidate models
        for (const modelName of CANDIDATE_MODELS) {
          try {
            groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
              },
              body: JSON.stringify({
                model: modelName,
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

            data = await groqResponse.json();

            if (groqResponse.ok && data.choices && data.choices[0]?.message?.content) {
              break; // Success!
            } else {
              lastError = data.error?.message || "Model request failed";
            }
          } catch (mErr) {
            lastError = mErr.message;
          }
        }

        if (!groqResponse || !groqResponse.ok || !data?.choices?.[0]?.message?.content) {
          console.error("Groq API Error:", lastError || data);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: lastError || "Failed to fetch response from AI provider" }));
          return;
        }

        const answer = data.choices[0].message.content;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ answer }));

      } catch (err) {
        console.error("Server proxy error:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Internal server error connecting to AI." }));
      }
    });
    return;
  }

  // Serve Static Frontend Files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`StudyMate AI running at http://localhost:${PORT}`);
});
