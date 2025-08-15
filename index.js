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
  var domain_from_web = req.body.domain;
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
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Chat API running on http://localhost:${PORT}`);
});
