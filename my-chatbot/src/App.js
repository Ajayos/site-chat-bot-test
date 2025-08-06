import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      text: "👋 Welcome! Start chatting with us or visit our site.",
      from: "bot",
      time: dayjs().format("HH:mm"),
      isWelcome: true
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { id: uuidv4(), text: input, from: "user", time: dayjs().format("HH:mm") };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Show typing animation
    setIsTyping(true);

    // Fake bot reply after delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          text: "This is a bot reply!",
          from: "bot",
          time: dayjs().format("HH:mm")
        }
      ]);
    }, 1500);
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
        {messages.map(m => (
          <div key={m.id} className={`message ${m.from}`}>
            <div className="msg-text">
              {m.text}
              {m.isWelcome && (
                <div className="welcome-buttons">
                  <a href="https://ajayos.in" target="_blank" rel="noopener noreferrer" className="chat-now-btn">
                    🌐 Visit Site
                  </a>
                  <a href="https://ajayos.in" target="_blank" rel="noopener noreferrer" className="contact-btn">
                    📞 Contact Us
                  </a>
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
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
