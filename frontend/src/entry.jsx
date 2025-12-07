// Use React from global scope
const { useState } = window.React;
const ReactDOM = window.ReactDOM;

// Chatbot component
const ChatBot = ({ apiUrl, botName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = { role: "bot", content: "" };
      setMessages(prev => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        try {
          const json = JSON.parse(chunk);
          if (json.response) {
            botMessage.content += json.response;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = botMessage;
              return newMessages;
            });
          }
        } catch {
          // ignore invalid JSON
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "bot", content: "⚠️ Error: Could not connect to the chatbot server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{botName || "Chatbot"}</h1>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: m.role === "user" ? "#d1e7ff" : "#e9ecef",
            }}
          >
            <b>{m.role === "user" ? "You" : "Bot"}:</b> {m.content}
          </div>
        ))}
        {loading && <p style={styles.loading}>Bot is thinking...</p>}
      </div>
      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: { width: "100%", maxWidth: 600, margin: "50px auto", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Arial, sans-serif" },
  title: { marginBottom: 20 },
  chatBox: { width: "100%", height: "60vh", border: "1px solid #ccc", borderRadius: 10, padding: 10, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, backgroundColor: "#f9f9f9" },
  message: { padding: 10, borderRadius: 10, maxWidth: "80%", wordBreak: "break-word" },
  loading: { fontStyle: "italic", color: "#777" },
  inputContainer: { marginTop: 10, display: "flex", width: "100%" },
  input: { flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc" },
  button: { marginLeft: 10, padding: "10px 20px", borderRadius: 10, border: "none", backgroundColor: "#007bff", color: "white", cursor: "pointer" },
};

// Expose UMD render function
window.ChatBotWidget = {
  render: (element, props) => {
    ReactDOM.render(<ChatBot {...props} />, element);
  },
};
