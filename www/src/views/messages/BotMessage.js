import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Slider from "@mui/material/Slider";
import { formatTime } from "../../utils/time";

export default function BotMessage({ message, ts, config }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [rightClickAnchor, setRightClickAnchor] = useState(null);

  const bubbleStyles = {
    position: "relative",
    bgcolor: config.botMessage.bg,
    color: config.botMessage.textColor,
    fontFamily: config.body.font,
    px: 2,
    py: 1,
    borderRadius: "12px",
    borderTopLeftRadius: "0px",
    maxWidth: "80%",
    whiteSpace: "pre-wrap",
    "&::before": {
      content: '""',
      position: "absolute",
      left: "-8px",
      top: "10px",
      width: 0,
      height: 0,
      borderTop: "8px solid transparent",
      borderRight: `8px solid ${config.botMessage.bg}`,
      borderBottom: "8px solid transparent",
    },
  };

  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleRightClick = (event) => {
    event.preventDefault();
    setRightClickAnchor(event.currentTarget);
  };
  const handleRightClickClose = () => setRightClickAnchor(null);

  const renderInteractive = () => {
    if (!message.interactive) return null;
    const { header, body, footer, buttons, list, radio, slider } =
      message.interactive;

    return (
      <Box>
        {header && (
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            {header.text || header.body}
          </Typography>
        )}
        {body && <Typography sx={{ mb: 1 }}>{body}</Typography>}
        {footer && (
          <Typography variant="caption" sx={{ opacity: 0.6, mb: 1 }}>
            {footer}
          </Typography>
        )}

        {/* Buttons & Chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {buttons?.map((btn, i) => {
            if (btn.type === "reply")
              return (
                <Button key={i} variant="contained" size="small">
                  {btn.reply.title}
                </Button>
              );
            if (btn.type === "url")
              return (
                <Button
                  key={i}
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(btn.url.payload, "_blank")}
                >
                  {btn.url.title}
                </Button>
              );
            if (btn.type === "otp")
              return (
                <Typography
                  key={i}
                  variant="h6"
                  sx={{
                    bgcolor: "#e0f7fa",
                    p: 1,
                    borderRadius: 1,
                    fontWeight: "bold",
                    color: "#00796b",
                    letterSpacing: 1,
                  }}
                >
                  {btn.otp.code}
                </Typography>
              );
            if (btn.type === "email")
              return (
                <Button
                  key={i}
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    window.open(`mailto:${btn.email.payload}`, "_self")
                  }
                >
                  {btn.email.title}
                </Button>
              );
            if (btn.type === "number")
              return (
                <input
                  key={i}
                  type="tel"
                  placeholder={btn.number.placeholder}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />
              );
            if (btn.type === "location")
              return (
                <Button key={i} variant="outlined" size="small">
                  {btn.location.title}
                </Button>
              );
            return null;
          })}
        </Box>

        {/* Interactive List */}
        {list && (
          <>
            <Button variant="outlined" size="small" onClick={handleMenuOpen}>
              {list.title || "Select an option"}
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              {list.items?.map((item, i) => (
                <MenuItem
                  key={i}
                  onClick={() => {
                    handleMenuClose();
                    if (item.url) window.open(item.url, "_blank");
                  }}
                >
                  {item.text}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {/* Radio Buttons */}
        {radio && (
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            {radio.items.map((item, i) => (
              <Chip
                key={i}
                label={item.label}
                clickable
                color="primary"
                onClick={() => console.log("Radio selected:", item.value)}
              />
            ))}
          </Box>
        )}

        {/* Slider / Progress */}
        {slider && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">{slider.label}</Typography>
            <Slider
              defaultValue={slider.value}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              onChangeCommitted={(e, val) => console.log("Slider value:", val)}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderContent = () => {
    switch (message.type) {
      case "text":
        return message.text?.body;
      case "image":
        return (
          <Box onContextMenu={handleRightClick}>
            <img
              src={message.image?.url}
              alt={message.image?.caption || "Image"}
              style={{
                maxWidth: "100%",
                borderRadius: 8,
                display: "block",
                marginBottom: message.image?.caption ? 4 : 0,
              }}
            />
            {message.image?.caption && (
              <Typography variant="body2">{message.image.caption}</Typography>
            )}
          </Box>
        );
      case "video":
        return (
          <Box onContextMenu={handleRightClick}>
            <video
              controls
              style={{
                maxWidth: "100%",
                borderRadius: 8,
                display: "block",
                marginBottom: message.video?.caption ? 4 : 0,
              }}
            >
              <source
                src={message.video?.url}
                type={message.video?.mime || "video/mp4"}
              />
            </video>
            {message.video?.caption && (
              <Typography variant="body2">{message.video.caption}</Typography>
            )}
          </Box>
        );
      case "audio":
        return (
          <audio
            controls
            src={message.audio?.url}
            style={{ width: "100%", borderRadius: 6 }}
          />
        );
      case "file":
        return (
          <a href={message.file?.url} download>
            {message.file?.name || "Download file"}
          </a>
        );
      case "sticker":
        return (
          <img
            src={message.sticker?.url}
            alt="Sticker"
            style={{ maxWidth: 120 }}
          />
        );
      case "contact":
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              border: "1px solid #ccc",
              borderRadius: 1,
              p: 1,
            }}
          >
            <Avatar src={message.contact?.avatar} />
            <Box>
              <Typography fontWeight="bold">{message.contact?.name}</Typography>
              {message.contact?.phone && (
                <Typography
                  variant="body2"
                  sx={{ color: "blue", cursor: "pointer" }}
                  onClick={() => window.open(`tel:${message.contact.phone}`)}
                >
                  📞 {message.contact.phone}
                </Typography>
              )}
              {message.contact?.email && (
                <Typography
                  variant="body2"
                  sx={{ color: "blue", cursor: "pointer" }}
                  onClick={() => window.open(`mailto:${message.contact.email}`)}
                >
                  ✉️ {message.contact.email}
                </Typography>
              )}
            </Box>
          </Box>
        );
      case "location":
        return (
          <Button variant="outlined" size="small">
            📍 Share Location
          </Button>
        );
      case "interactive":
        return renderInteractive();
      case "notification":
        return (
          <Typography sx={{ fontStyle: "italic", opacity: 0.8 }}>
            {message.notification?.body}
          </Typography>
        );
      default:
        return "[Unsupported message type]";
    }
  };

  return (
    <Box display="flex" justifyContent="flex-start" mb={1}>
      <Box sx={bubbleStyles}>
        {renderContent()}

        <Typography
          variant="caption"
          display="block"
          textAlign="right"
          sx={{ opacity: 0.6, mt: 0.5 }}
        >
          {formatTime(ts, { format: "hh:mm A" })}
        </Typography>

        {/* Right-click Menu */}
        <Menu
          anchorEl={rightClickAnchor}
          open={Boolean(rightClickAnchor)}
          onClose={handleRightClickClose}
        >
          <MenuItem
            onClick={() => {
              navigator.clipboard.writeText(message.text?.body || "");
              handleRightClickClose();
            }}
          >
            Copy Message
          </MenuItem>
          {message.file?.url && (
            <MenuItem
              onClick={() => {
                window.open(message.file.url, "_blank");
                handleRightClickClose();
              }}
            >
              Download File
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              console.log("Message info:", message);
              handleRightClickClose();
            }}
          >
            Message Info
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
