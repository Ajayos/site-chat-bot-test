import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      text: "👋 Welcome! Start chatting with us or choose an option below.",
      from: "bot",
      time: dayjs().format("HH:mm"),
      isWelcome: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clickedButtons, setClickedButtons] = useState({
    site: false,
    contact: false,
  });
  const chatBodyRef = useRef(null);

  const sendMessage = (text = null) => {
    const msgText = text || input;
    if (!msgText.trim()) return;

    const userMsg = {
      id: uuidv4(),
      text: msgText,
      from: "user",
      time: dayjs().format("HH:mm"),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput("");

    // Show typing animation
    setIsTyping(true);

    // Fake bot reply after delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: `Bot received: "${msgText}"`,
          from: "bot",
          time: dayjs().format("HH:mm"),
        },
      ]);
    }, 1500);
  };

  const handleButtonClick = (type) => {
    if (clickedButtons[type]) return; // already clicked

    setClickedButtons((prev) => ({ ...prev, [type]: true }));

    if (type === "site") {
      window.open("https://vitejs.dev/", "_blank");
      sendMessage("🌐 Visited Vite site");
    } else if (type === "contact") {
      window.open("https://ajayos.in/contact", "_blank");
      sendMessage("📞 Opened Contact Page");
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="chat-fullscreen">
      <div className="chat-header">
        <span>💬 Chat with us</span>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.from}`}>
            <div className="msg-text">
              {m.text}
              {m.isWelcome && (
                <div className="welcome-buttons">
                  <button
                    className={`chat-now-btn ${clickedButtons.site ? "clicked" : ""}`}
                    onClick={() => handleButtonClick("site")}
                    disabled={clickedButtons.site}
                  >
                    🌐 Visit Vite Site
                  </button>
                  <button
                    className={`contact-btn ${clickedButtons.contact ? "clicked" : ""}`}
                    onClick={() => handleButtonClick("contact")}
                    disabled={clickedButtons.contact}
                  >
                    📞 Contact Us
                  </button>
                </div>
              )}
            </div>
            <div className="msg-time">{m.time}</div>
          </div>
        ))}

        {/* Typing Animation */}
        {isTyping && (
          <div className="message bot">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  );
}
