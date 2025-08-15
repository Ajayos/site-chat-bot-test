import React, { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion, useAnimation } from "framer-motion";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { formatTime } from "../../utils/time";

const statusIcons = { sent: "✔️", delivered: "✔✔", read: "✔✔" };

export default function UserMessage({ message, ts, config }) {
  const emojiRef = useRef(null);
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [openMedia, setOpenMedia] = useState(false);

  // Right-click menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const isSingleEmoji = (text) => /\p{Emoji}/u.test(text) && text?.length <= 2;

  useEffect(() => {
    if (!isSingleEmoji(message.text?.body)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            controls.start({
              scale: [1, 1.2, 1],
              transition: { duration: 1.5 },
            });
            setHasAnimated(true);
          } else if (!entry.isIntersecting) setHasAnimated(false);
        });
      },
      { threshold: 0.5 }
    );
    if (emojiRef.current) observer.observe(emojiRef.current);
    return () => {
      if (emojiRef.current) observer.unobserve(emojiRef.current);
    };
  }, [controls, hasAnimated, message.text]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuAnchor({ mouseX: e.clientX + 2, mouseY: e.clientY - 4 });
  };
  const handleCloseMenu = () => setMenuAnchor(null);

  // Clipboard copy
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || "");
    handleCloseMenu();
  };

  // File download
  const downloadFile = async (url, name = false) => {
    try {
      const fileName = name || url.split("/").pop();
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      handleCloseMenu();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const renderMedia = () => {
    const commonStyle = {
      width: "100%",
      maxWidth: "250px",
      maxHeight: "250px",
      borderRadius: "8px",
      display: "block",
      objectFit: "cover",
      cursor: "pointer",
    };

    switch (message.type) {
      case "text":
      case "response":
        if (isSingleEmoji(message[message.type]?.body)) {
          return (
            <motion.div
              ref={emojiRef}
              animate={controls}
              style={{ display: "inline-block" }}
              onContextMenu={handleContextMenu} // enable right-click
            >
              <Typography
                variant="h3"
                sx={{ lineHeight: 1, textAlign: "center" }}
              >
                {message[message.type]?.body}
              </Typography>
            </motion.div>
          );
        }
        return (
          <Typography onContextMenu={handleContextMenu}>
            {message[message.type]?.body}
          </Typography>
        );

      case "image":
        return (
          <>
            <img
              src={message.image?.url}
              alt={message.image?.caption || "Image"}
              style={commonStyle}
              onClick={() => setOpenMedia(true)}
              onContextMenu={handleContextMenu}
            />
            {message.image?.caption && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", wordBreak: "break-word" }}
              >
                {message.image.caption}
              </Typography>
            )}
          </>
        );

      case "video":
        return (
          <>
            <video
              src={message.video?.url}
              controls
              style={commonStyle}
              onClick={() => setOpenMedia(true)}
              onContextMenu={handleContextMenu}
            />
            {message.video?.caption && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", wordBreak: "break-word" }}
              >
                {message.video.caption}
              </Typography>
            )}
          </>
        );

      case "audio":
        return (
          <audio
            controls
            style={{ width: "100%", maxWidth: "250px" }}
            onContextMenu={handleContextMenu}
          >
            <source
              src={message.audio?.url}
              type={message.audio?.mime || "audio/mpeg"}
            />
          </audio>
        );

      case "file":
        return (
          <a
            href={message.file?.url}
            download
            style={{
              color: config.userMessage.textColor,
              textDecoration: "none",
            }}
            onContextMenu={handleContextMenu}
          >
            📄 {message.file?.name || "Download file"}
          </a>
        );

      default:
        return "[Unsupported message type]";
    }
  };

  const bubbleStyles = {
    position: "relative",
    bgcolor: config.userMessage.bg,
    color: config.userMessage.textColor,
    fontFamily: config.body.font,
    px: 1.5,
    py: 1,
    borderRadius: "12px",
    maxWidth: "80%",
    width: "fit-content",
    minWidth: "50px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  const copyText =
    message[message.type]?.body ||
    message[message.type]?.caption ||
    message.file?.name ||
    "";

  const menuItems = [
    { label: "Copy", action: () => copyToClipboard(copyText) },
  ];

  if (["image", "video", "audio", "file"].includes(message.type)) {
    menuItems.push({
      label: "Download",
      action: () =>
        downloadFile(
          message[message.type]?.url,
          message[message.type]?.filename
        ),
    });
  }

  menuItems.push({
    label: "Info",
    action: () => {
      setInfoOpen(true);
      handleCloseMenu();
    },
  });

  return (
    <Box display="flex" justifyContent="flex-end" mb={1} sx={{ width: "100%" }}>
      <Box sx={bubbleStyles}>
        {renderMedia()}
        {(message.type === "text" ||
          message.type === "image" ||
          message.type === "video") && (
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            mt={0.5}
          >
            <Typography variant="caption" sx={{ opacity: 0.8, mr: 0.5 }}>
              {formatTime(ts, { format: "hh:mm A" })}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {statusIcons[message.status] || ""}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Media Lightbox */}
      {(message.type === "image" || message.type === "video") && (
        <Dialog
          open={openMedia}
          onClose={() => setOpenMedia(false)}
          maxWidth="lg"
        >
          {message.type === "image" ? (
            <img
              src={message.image.url}
              alt={message.image?.caption || "Image"}
              style={{ maxWidth: "90vw", maxHeight: "90vh" }}
            />
          ) : (
            <video
              src={message.video.url}
              controls
              style={{ maxWidth: "90vw", maxHeight: "90vh" }}
            />
          )}
        </Dialog>
      )}

      {/* Info Modal with table */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogTitle>{message.type} Info</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {Object.entries(message[message.type]).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={() => setInfoOpen(false)}>Close</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Right-click menu */}
      <Menu
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          menuAnchor
            ? { top: menuAnchor.mouseY, left: menuAnchor.mouseX }
            : undefined
        }
      >
        {menuItems.map((item, i) => (
          <MenuItem key={i} onClick={item.action}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
