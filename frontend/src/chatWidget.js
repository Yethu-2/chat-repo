// Use global React from CDN
const React = window.React;
const { useState, createElement: h } = React;
const ReactDOM = window.ReactDOM;

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
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = { role: "bot", content: "" };

      setMessages((prev) => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.trim().split("\n");

        for (const line of lines) {
          if (!line.startsWith("{")) continue;

          try {
            const json = JSON.parse(line);
            if (json.response) {
              botMessage.content += json.response;
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

  return h("div", { style: styles.container },
    h("h1", { style: styles.title }, "Custom Chatbot"),
    h("div", { style: styles.chatBox },
      messages.map((msg, i) =>
        h("div", {
          key: i,
          style: {
            ...styles.message,
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            backgroundColor: msg.role === "user" ? "#d1e7ff" : "#e9ecef",
          }
        },
          h("b", null, msg.role === "user" ? "You" : "Bot", ":"),
          " ",
          msg.content
        )
      ),
      loading && h("p", { style: styles.loading }, "Bot is thinking...")
    ),
    h("div", { style: styles.inputContainer },
      h("input", {
        style: styles.input,
        type: "text",
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: "Type your message...",
        onKeyDown: (e) => e.key === "Enter" && sendMessage()
      }),
      h("button", { style: styles.button, onClick: sendMessage }, "Send")
    )
  );
};

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

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll('[data-chat]');
    
    elements.forEach(element => {
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(element);
        root.render(h(Chat));
      } else {
        ReactDOM.render(h(Chat), element);
      }
    });
  });
}

// Expose manual render function
if (typeof window !== 'undefined') {
  window.ChatWidget = {
    render: (element, props = {}) => {
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(element);
        root.render(h(Chat, props));
      } else {
        ReactDOM.render(h(Chat, props), element);
      }
    },
  };
}

export default Chat;
