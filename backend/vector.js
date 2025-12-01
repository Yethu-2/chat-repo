import { ChromaClient } from "chromadb";
import fetch from "node-fetch"; // add if needed

// ✅ Local in-process Chroma
const client = new ChromaClient({ path: "local" });

// ✅ Disable default embedder
const collection = await client.getOrCreateCollection({
  name: "user1",
  embeddingFunction: null,
});

// Embedding via Ollama
async function getEmbedding(text) {
  const res = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      input: text,
    }),
  });

  const data = await res.json();
  return data.embedding;
}

// Store text + embedding
export async function embedAndStore(userId, text) {
  const embedding = await getEmbedding(text);
  await collection.add({
    ids: [Date.now().toString()],
    embeddings: [embedding],
    documents: [text],
  });
}

// Query context
export async function searchContext(userId, query) {
  const queryEmbedding = await getEmbedding(query);
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 3,
  });
  return results.documents?.flat().join("\n") || "";
}
