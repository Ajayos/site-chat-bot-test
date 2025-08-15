const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
// json parser
app.use(express.urlencoded({ extended: true }));

// Storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({ storage });

// Load example messages
const examples = JSON.parse(fs.readFileSync("./examples.json", "utf-8"));
const domains = JSON.parse(fs.readFileSync("./domains.json", "utf-8"));

function getRandomMessage() {
  return examples[Math.floor(Math.random() * examples.length)];
}

var index = 0;
// POST /api/chat — handle incoming user messages (text only)
app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  console.log("📩 Received message from user:", message);

  // Pick a random example to send back
  let reply1 = getRandomMessage();

  let reply2 = {
    from: "bot",
    type: "interactive",
    interactive: {
      type: "image", // custom grouping
      header: {
        url: "https://github.com/Ajayos.png",
      },
      body: "Choose an option:",
      footer: "Tap any button to continue",
      buttons: [
        {
          type: "reply",
          reply: { title: "✅ Confirm", id: "confirm_123" },
        },
        {
          type: "url",
          url: { title: "🌐 Visit Website", payload: "https://example.com" },
        },
        {
          type: "otp",
          otp: { code: "123456" },
        },
        {
          type: "email",
          email: { title: "📧 Email Support", payload: "support@example.com" },
        },
        {
          type: "number",
          number: { title: "📞 Call Us", placeholder: "+1 555 123 4567" },
        },
        {
          type: "location",
          location: {
            title: "📍 View Location",
            name: "Kochi Office",
            address: "MG Road, Kochi, Kerala, India",
            latitude: 9.9312,
            longitude: 76.2673,
          },
        },
      ],
    },
  };

  let reply = examples[index];
  index++;
  if (index >= examples.length) index = 0;

  reply = {
    ...reply,
    id: randomUUID(),
    ts: new Date().toISOString(),
  };

  res.json(reply);
});

// POST /api/media — handle media uploads
app.post("/api/media", upload.single("file"), (req, res) => {
  const file = req.file;
  const { type } = req.body; // expected: image, video, audio, document, sticker

  if (!file) return res.status(400).json({ error: "No file uploaded." });
  if (!type) return res.status(400).json({ error: "Missing media type." });

  console.log(`📁 Received ${type}:`, file.originalname);

  // Mock mediaId (in real apps, save to DB or cloud storage)
  const mediaId = randomUUID();

  // You could store metadata in a database here
  const mediaRecord = {
    id: mediaId,
    filename: file.filename,
    type,
    url: `${process.env.domain}/uploads/${file.filename}`, // static URL
    ts: new Date().toISOString(),
  };

  // Return mediaId to frontend
  res.json({ mediaId, url: mediaRecord.url });
});

// POST /api/media — handle media uploads
app.post("/api/config", (req, res) => {
  // console.log(`🔧 Config update request received for domain: ${req_domain}`);
  var domain_from_web = req?.body?.domain || "";
  domain_from_web = domain_from_web.replace(/\/$/, ""); // Remove trailing slash
  domain_from_web = domain_from_web.replace(/^https?:\/\//, ""); // Remove protocol
  console.log(
    `🔧 Config update request received for domain: ${domain_from_web}`
  );
  if (!domain_from_web) {
    return res.status(400).json({ error: "Missing domain." });
  }
  console.log(`🔧 Config updated: domain = ${domain_from_web}`);
  var domain_config = domains[domain_from_web] || {
    header: {
      text: "AOS - from non",
      icon: "https://github.com/Ajay-o-s.png",
      color: "#05c9faff",
      textColor: "#ffffff",
      font: "'Poppins', sans-serif",
      fontWeight: 600,
    },
    body: {
      bg: "https://github.com/Ajay-o-s.png",
      font: "'Poppins', sans-serif",
    },
    userMessage: {
      bg: "#4A90E2",
      textColor: "#ffffff",
    },
    botMessage: {
      bg: "#EDEDED",
      textColor: "#000000",
    },
    systemMessage: {
      info: "#2196f3",
      warning: "#ff9800",
      success: "#4caf50",
      error: "#f44336",
    },
    footer: {
      color: "#ffffff",
    },
    input: {
      placeholder: "Ask me anything...",
    },
  };

  domain_config.domain = process.env.domain;
  res.json(domain_config);
});

// POST /api/media — handle media uploads
app.get("/chatbot-widget", (req, res) => {
  var js_file = `(function () {
  const CHAT_URL = "https://ajayos.in/site-chat-bot-test/www/build/";

  function injectWidget() {
    if (
      document.querySelector(".chatbot-btn") ||
      document.querySelector(".chatbot-frame")
    ) {
      return; // already there
    }

    console.log("[Chatbot] Injecting movable button + fixed chat...");

    // Styles
    if (!document.getElementById("chatbot-style")) {
      const style = document.createElement("style");
      style.id = "chatbot-style";
      style.innerHTML = \`
        .chatbot-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: #007bff;
          color: white;
          font-size: 28px;
          border: none;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 99999;
          user-select: none;
        }
        .chatbot-btn:active {
          cursor: grabbing;
        }
        .chatbot-frame {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 500px;
          height: 500px;
          border: none;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 99998;
          display: none;
        }
      \`;
      document.head.appendChild(style);
      console.log("[Chatbot] Styles injected.");
    }

    // Iframe (Fixed Position)
    const iframe = document.createElement("iframe");
    iframe.className = "chatbot-frame";
    iframe.src = CHAT_URL;
    iframe.width = "500px"; // set width
    iframe.onload = () => console.log("[Chatbot] Iframe loaded:", CHAT_URL);
    document.body.appendChild(iframe);

    // Button (Movable)
    const button = document.createElement("button");
    button.className = "chatbot-btn";
    button.innerHTML = "💬";
    document.body.appendChild(button);

    // Toggle chat visibility
    button.addEventListener("click", (e) => {
      if (e.detail === 0) return; // ignore drag clicks
      const isHidden =
        iframe.style.display === "none" || iframe.style.display === "";
      iframe.style.display = isHidden ? "block" : "none";
      console.log(\`[Chatbot] Chat ${isHidden ? "opened" : "closed"}\`);
    });

    // Dragging logic for button only
    let offsetX,
      offsetY,
      isDragging = false;

    button.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - button.getBoundingClientRect().left;
      offsetY = e.clientY - button.getBoundingClientRect().top;
      button.style.transition = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;
      left = Math.max(
        0,
        Math.min(window.innerWidth - button.offsetWidth, left)
      );
      top = Math.max(
        0,
        Math.min(window.innerHeight - button.offsetHeight, top)
      );
      button.style.left = left + "px";
      button.style.top = top + "px";
      button.style.right = "auto";
      button.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        button.style.transition = "all 0.2s";
      }
    });

    console.log("[Chatbot] Movable button + fixed chat added.");
  }

  function startObserver() {
    console.log("[Chatbot] Starting MutationObserver...");
    const observer = new MutationObserver(() => {
      if (
        !document.querySelector(".chatbot-btn") ||
        !document.querySelector(".chatbot-frame")
      ) {
        console.log("[Chatbot] Widget missing — re-injecting...");
        injectWidget();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initWidget() {
    console.log("[Chatbot] Waiting for page to stabilize...");
    setTimeout(() => {
      injectWidget();
      startObserver();
    }, 2000); // wait 2s
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initWidget();
  } else {
    document.addEventListener("DOMContentLoaded", initWidget);
  }
})();
`;

  res.send(js_file);
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Chat API running on http://localhost:${PORT}`);
});
