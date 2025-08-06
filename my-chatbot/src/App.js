import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import "./App.css";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: uuidv4(), text: "Hi! How can I help you?", from: "bot", time: dayjs().format("HH:mm") }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { id: uuidv4(), text: input, from: "user", time: dayjs().format("HH:mm") };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Fake bot reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: uuidv4(), text: "This is a bot reply!", from: "bot", time: dayjs().format("HH:mm") }
      ]);
    }, 800);
  };

  return (
    <>
      {/* Welcome Card */}
      {!isOpen && (
        <div className="welcome-card">
          <h2>Welcome</h2>
          <p>Start chatting or visit our site</p>
          <div className="welcome-buttons">
            <button className="chat-now-btn" onClick={() => setIsOpen(true)}>
              💬 Chat Now
            </button>
            <a href="https://ajayos.in/contact" target="_blank" rel="noopener noreferrer" className="contact-btn">
              📞 Contact Us
            </a>
          </div>
        </div>
      )}

      {/* Popup Chat Window */}
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>Chat with us</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <div className="chat-body">
            {messages.map(m => (
              <div key={m.id} className={`message ${m.from}`}>
                <div className="msg-text">{m.text}</div>
                <div className="msg-time">{m.time}</div>
              </div>
            ))}
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
      )}
    </>
  );
}
