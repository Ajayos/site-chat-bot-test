const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const multer = require("multer");

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

function getRandomMessage() {
  return examples[Math.floor(Math.random() * examples.length)];
}

// POST /api/chat — handle incoming user messages (text only)
app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  console.log("📩 Received message from user:", message);

  // Pick a random example to send back
  let reply = getRandomMessage();
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
    url: `/uploads/${file.filename}`, // static URL
    ts: new Date().toISOString(),
  };

  // Return mediaId to frontend
  res.json({ mediaId, url: mediaRecord.url });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Chat API running on http://localhost:${PORT}`);
});
