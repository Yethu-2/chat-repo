import React, { useState } from "react";

// Use configurable API URL: browser will not reach localhost when deployed.
const API_URL =
  // Option 1: set at runtime, e.g., window.CHAT_API_URL = "https://your-domain.com/chat"
  (typeof window !== "undefined" && window.CHAT_API_URL) ||
  // Option 2: Vite env var at build time
  import.meta.env.VITE_API_URL ||
  // Fallback: EC2 public endpoint (adjust if you change hosts)
  "http://98.88.201.132:4000/chat";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = { role: "bot", content: "" };

      // Add initial bot message (empty, will stream in)
      setMessages((prev) => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.trim().split("\n");

        for (const line of lines) {
          if (!line.startsWith("{")) continue; // ignore non-JSON parts

          try {
            const json = JSON.parse(line);
            if (json.response) {
              botMessage.content += json.response;
              // Update the latest message as it streams in
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...botMessage };
                return updated;
              });
            }
          } catch (err) {
            console.warn("Skipping invalid JSON line:", line);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Error: Could not connect to the chatbot server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Custom Chatbot</h1>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.role === "user" ? "#d1e7ff" : "#e9ecef",
            }}
          >
            <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
          </div>
        ))}
        {loading && <p style={styles.loading}>Bot is thinking...</p>}
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

// Simple inline CSS
const styles = {
  container: {
    width: "100%",
    maxWidth: 600,
    margin: "50px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    marginBottom: 20,
  },
  chatBox: {
    width: "100%",
    height: "60vh",
    border: "1px solid #ccc",
    borderRadius: 10,
    padding: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    backgroundColor: "#f9f9f9",
  },
  message: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    wordBreak: "break-word",
  },
  loading: {
    fontStyle: "italic",
    color: "#777",
  },
  inputContainer: {
    marginTop: 10,
    display: "flex",
    width: "100%",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
  },
  button: {
    marginLeft: 10,
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};

export default Chat;