import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import SendIcon from "@mui/icons-material/Send";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import EmojiPicker from "emoji-picker-react";
import { useChat } from "../context/ChatContext";
import { nanoid } from "@reduxjs/toolkit";

export default function Footer({ onSendMedia }) {
  const config = useSelector((state) => state.config);
  const { sendMessage } = useChat();

  const [message, setMessage] = useState("");
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const fileTypeRef = useRef(null);
  const pickerRef = useRef(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        e.target.id !== "emoji-btn"
      ) {
        setEmojiVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage({
      id: nanoid(),
      from: "user",
      type: "text",
      text: { body: message },
      ts: new Date().toISOString(),
    });
    setMessage("");
  };

  const handleEmojiSelect = (emoji) => setMessage((prev) => prev + emoji.emoji);

  const handleAddClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMediaSelect = (type) => {
    fileTypeRef.current = type;
    if (type === "sticker") {
      console.log("Open sticker picker here");
    } else {
      fileInputRef.current?.click();
    }
    handleMenuClose();
  };

  const handleFileChange = async (event) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) return;

    const type = fileTypeRef.current;
    const allowedTypes = {
      image: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      video: ["video/mp4", "video/webm", "video/ogg"],
      audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"],
    };

    if (type !== "document" && !allowedTypes[type]?.includes(file.type)) {
      alert(`Invalid ${type} file selected.`);
      event.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("http://localhost:5000/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const mediaId = data.mediaId;

      sendMessage({
        id: nanoid(),
        from: "user",
        type,
        [type]: {
          id: mediaId,
          url: "http://localhost:5000" + data.url,
          mime: file.type,
          filename: file.name,
        },
        ts: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to upload media:", err);
    }

    event.target.value = "";
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      p={1}
      bgcolor={config.footer.color}
      borderTop="1px solid #ccc"
      position="relative"
    >
      {/* Emoji Picker Button */}
      <Tooltip title="Emoji">
        <IconButton
          id="emoji-btn"
          onClick={() => setEmojiVisible((prev) => !prev)}
        >
          <InsertEmoticonIcon sx={{ color: "#555" }} />
        </IconButton>
      </Tooltip>

      {/* Emoji Picker Dropdown (always mounted, toggle visibility) */}
      <Box
        ref={pickerRef}
        sx={{
          position: "absolute",
          bottom: "50px",
          left: "10px",
          zIndex: 10,
          display: emojiVisible ? "block" : "none",
          bgcolor: "#fff",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiSelect} />
      </Box>

      {/* Add Media Button */}
      <Tooltip title="Add Media">
        <IconButton onClick={handleAddClick}>
          <AddCircleOutlineIcon sx={{ color: "#555" }} />
        </IconButton>
      </Tooltip>

      {/* Media Selection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMediaSelect("image")}>Image</MenuItem>
        <MenuItem onClick={() => handleMediaSelect("video")}>Video</MenuItem>
        <MenuItem onClick={() => handleMediaSelect("audio")}>Audio</MenuItem>
        <MenuItem onClick={() => handleMediaSelect("document")}>
          Document
        </MenuItem>
        <MenuItem onClick={() => handleMediaSelect("sticker")}>
          Sticker
        </MenuItem>
      </Menu>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />

      {/* Message Input */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={config.input.placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
        sx={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          "& fieldset": { border: "none" },
        }}
      />

      {/* Send Button */}
      <Tooltip title="Send">
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
