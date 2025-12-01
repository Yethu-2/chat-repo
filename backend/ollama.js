import fetch from "node-fetch";

export async function askOllama(prompt, context) {
  const fullPrompt = `
  You are a helpful assistant. Use the following context if relevant:
  ${context}
  ---
  User: ${prompt}
  `;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3", // Must be installed via "ollama pull llama3"
      prompt: fullPrompt
    })
  });

  const data = await response.text();
  return data;
}
