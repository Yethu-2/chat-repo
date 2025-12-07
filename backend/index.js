import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Load your background info once
const aboutMe = fs.readFileSync("./data/about_me.txt", "utf8");
const aboutLin = fs.readFileSync("./data/about_lin.txt", "utf8");

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const ollamaRes = await fetch("http://3.90.153.55:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma3:1b-it-qat", // fast model
        stream: true, // enable streaming
        prompt: `You are helpful assistant for Immortal Linn's game items store. 
Use the following background information to answer the customer's questions shortly:

${aboutLin}

User: ${message}
Assistant:`,
      }),
    });

    // Tell browser we're streaming text
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    // Forward data from Ollama to client in real time
    for await (const chunk of ollamaRes.body) {
      const text = chunk.toString();
      res.write(text); // send immediately
    }

    res.end();
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Something went wrong with Ollama");
  }
});

app.listen(4000, "0.0.0.0", () =>
  console.log("✅ Server running on http://localhost:4000 (streaming mode)")
);