import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Ollama chatbot backend is running!");
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("http://3.95.249.74:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma:2b",
        prompt: message,
        stream: true, // <-- This makes Ollama return a full response instead of chunks
      }),
    });

    const data = await response.json();
    console.log("🧠 Ollama response:", data.response); // Optional log
    res.json({ reply: data.response });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Something went wrong with Ollama");
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));