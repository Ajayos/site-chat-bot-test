import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Slider from "@mui/material/Slider";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import PushPinIcon from "@mui/icons-material/PushPin";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PlaceIcon from "@mui/icons-material/Place";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { formatTime } from "../../utils/time";
import AudioPlayer from "../../components/AudioPlayer";

/**
 * Advanced BotMessage
 * - Rich context menu (right-aligned)
 * - Media lightbox (image/video/file)
 * - Interactive header/body/footer + WhatsApp-style buttons
 * - Responsive cards for media/contact/location
 * - Extras: copy helpers, selected button state, meta/ticks slot
 */
export default function BotMessage({ message, ts, config }) {
  const [contextAnchor, setContextAnchor] = useState(null);
  const [interactiveMenuAnchor, setInteractiveMenuAnchor] = useState(null);
  const [lightbox, setLightbox] = useState({
    open: false,
    url: null,
    type: null,
  });
  const [lastSelectedButtonIdx, setLastSelectedButtonIdx] = useState(null);
  // ------- Styles -------
  const bubbleSx = useMemo(
    () => ({
      position: "relative",
      bgcolor: config?.botMessage?.bg || "#f1f5f9",
      color: config?.botMessage?.textColor || "#111827",
      fontFamily: config?.body?.font || "Inter, system-ui, Arial",
      // px: 1,
      // py: 0.75,
      borderRadius: "14px",
      borderTopLeftRadius: "0px",
      maxWidth: "92%",
      whiteSpace: "pre-wrap",
      boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
      "&::before": {
        content: '""',
        position: "absolute",
        left: "-8px",
        top: "10px",
        width: 0,
        height: 0,
        borderTop: "8px solid transparent",
        borderRight: `8px solid ${config?.botMessage?.bg || "#f1f5f9"}`,
        borderBottom: "8px solid transparent",
      },
    }),
    [config]
  );

  const headerBoxSx = {
    p: 1,
    bgcolor: config?.botMessage?.bg,
    borderBottom: config?.botMessage?.bg,
  };

  const footerSx = {
    px: 1,
    py: 0.75,
    bgcolor: config?.botMessage?.bg,
    display: "block",
    color: "#65676bff",
  };

  const buttonStackSx = {
    display: "flex",
    flexDirection: "column",
    pt: 0,
    bgcolor: "none",
  };

  const wButtonSx = (selected, end = false) => ({
    justifyContent: "center",
    textTransform: "none",
    fontWeight: 600,
    py: 0.7,
    px: -5.2,
    gap: 1,
    width: "100%", // Full width
    bgcolor: selected ? "#1091dbff" : "#3a74f1ff",
    "&:hover": { bgcolor: selected ? "#0047b3ff" : "#0047b3ff" },
    // if end true then have a down have round like
    borderBottomLeftRadius: end ? "25px" : "0px",
    borderBottomRightRadius: end ? "25px" : "0px",
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
  });

  // ------- Helpers -------
  const openContext = (e) => {
    e.preventDefault();
    setContextAnchor(e.currentTarget);
  };
  const closeContext = () => setContextAnchor(null);

  const openLightbox = (url, type) => setLightbox({ open: true, url, type });
  const closeLightbox = () =>
    setLightbox({ open: false, url: null, type: null });

  const getPrimaryMediaUrl = () =>
    message?.image?.url ||
    message?.video?.url ||
    message?.file?.url ||
    message?.audio?.url ||
    message?.interactive?.header?.url ||
    null;

  const canCopy = !!(
    message?.text?.body ||
    message?.image?.caption ||
    message?.video?.caption ||
    message?.notification?.body ||
    message?.interactive?.body
  );

  const copyText = async () => {
    const text =
      message?.text?.body ||
      message?.image?.caption ||
      message?.video?.caption ||
      message?.notification?.body ||
      message?.interactive?.body ||
      "";
    try {
      await navigator.clipboard.writeText(text);
      closeContext();
    } catch (e) {
      console.warn("Copy failed", e);
      closeContext();
    }
  };

  const openOrDownload = async () => {
    const url = getPrimaryMediaUrl();
    if (!url) return;
    try {
      const fileName = url.split("/").pop(); // Extract filename from URL
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
      // Prefer opening in new tab; user can save there.
      closeContext();
    } catch (err) {
      console.error(err);
      window.open(url, "_blank");
      closeContext();
    }
  };

  const showInfo = () => {
    console.log("Message info:", message);
    closeContext();
  };

  // Centralized Button Action Handler
  const handleButtonClick = (btn, idx) => {
    setLastSelectedButtonIdx(idx);
    if (!btn) return;
    switch (btn.type) {
      case "reply":
        console.log("Reply clicked:", btn.reply.title);
        break;
      case "url":
        window.open(btn.url.payload, "_blank");
        break;
      case "otp":
        navigator.clipboard.writeText(btn.otp.code || "");
        console.log("OTP copied:", btn.otp.code);
        break;
      case "email":
        window.open(`mailto:${btn.email.payload}`, "_self");
        break;
      case "number":
        console.log("Phone input placeholder:", btn.number.placeholder);
        break;
      case "location": {
        const { name, address, latitude, longitude } = btn.location;
        const query = encodeURIComponent(
          `${name || ""} ${address || ""}`.trim()
        );
        const maps = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}${
          query ? ` (${query})` : ""
        }`;
        window.open(maps, "_blank");
        break;
      }
      default:
        console.warn("Unhandled button type:", btn.type);
    }
  };

  // ------- Interactive Renderer -------
  const renderInteractive = () => {
    if (!message?.interactive) return null;
    const { header, body, footer, buttons, list, radio, slider, type } =
      message.interactive;

    return (
      <Box
        sx={{
          overflow: "hidden",
          minWidth: 400,
          maxWidth: 400,
        }}
      >
        {/* Header */}
        {header && (
          <Box sx={headerBoxSx}>
            {type === "image" && header.url && (
              <Card
                variant="outlined"
                sx={{
                  // borderColor: "#eef2f7",
                  // borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <CardMedia
                  component="img"
                  src={header.url}
                  alt={header.caption || "Image"}
                  onClick={() => openLightbox(header.url, "image")}
                  sx={{ cursor: "zoom-in" }}
                />
              </Card>
            )}

            {type === "video" && header.url && (
              <Card
                variant="outlined"
                sx={{ borderColor: "#eef2f7", borderRadius: 2 }}
              >
                <CardMedia
                  component="video"
                  controls
                  src={header.url}
                  onDoubleClick={() => openLightbox(header.url, "video")}
                  sx={{ borderRadius: 2 }}
                />
              </Card>
            )}

            {type === "document" && header.url && (
              <Stack direction="row" spacing={1} alignItems="center">
                <InsertDriveFileIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {header.filename || "Document"}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Open">
                  <IconButton
                    size="small"
                    onClick={() => window.open(header.url, "_blank")}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download / Open in new tab">
                  <IconButton
                    size="small"
                    onClick={() => openLightbox(header.url, "document")}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}

            {type === "text" && (
              <Typography fontWeight="bold">{header}</Typography>
            )}
          </Box>
        )}

        {/* Body */}
        {body && (
          <Box sx={{ px: 1, py: 1, width: "100%" }}>
            <Typography>{body}</Typography>
          </Box>
        )}

        {/* Footer */}
        {footer && (
          <Box sx={{ px: 1, py: 1, width: "100%" }}>
            <Typography variant="caption" sx={footerSx}>
              {footer}
            </Typography>
          </Box>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ px: 1, py: 0.5 }}
        >
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            {formatTime(ts, { format: "hh:mm A" })}
          </Typography>
        </Stack>

        {/* Buttons */}
        {buttons?.length > 0 && (
          <Box sx={buttonStackSx}>
            {buttons.map((btn, i) => {
              const getButtonIcon = (type) => {
                switch (type) {
                  case "reply":
                    return <ReplyIcon />;
                  case "url":
                    return <OpenInNewIcon />;
                  case "email":
                    return <EmailIcon />;
                  case "location":
                    return <PlaceIcon />;
                  case "otp":
                    return <ContentCopyIcon />;
                  case "number":
                    return <PhoneIcon />;
                  default:
                    return null;
                }
              };

              const btnLabel =
                btn.reply?.title ||
                btn.url?.title ||
                btn.email?.title ||
                btn.location?.title ||
                btn.otp?.code ||
                btn.number?.title ||
                "Button";

              return (
                <Button
                  key={i}
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => handleButtonClick(btn, i, "button")}
                  sx={wButtonSx(
                    lastSelectedButtonIdx === i,
                    i === buttons.length - 1
                  )}
                  startIcon={getButtonIcon(btn.type)}
                >
                  {btnLabel}
                </Button>
              );
            })}
          </Box>
        )}

        {/* List Menu */}
        {message.interactive.list && (
          <Box sx={{ px: 1, pb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={(e) => setInteractiveMenuAnchor(e.currentTarget)}
              sx={{ mt: 1 }}
            >
              {message.interactive.list.title || "Select an option"}
            </Button>
            <Menu
              anchorEl={interactiveMenuAnchor}
              open={Boolean(interactiveMenuAnchor)}
              onClose={() => setInteractiveMenuAnchor(null)}
            >
              {message.interactive.list.items?.map((item, i) => (
                <MenuItem
                  key={i}
                  onClick={() => {
                    setInteractiveMenuAnchor(null);
                    if (item.url) window.open(item.url, "_blank");
                    if (item.onSelect) item.onSelect(item);
                  }}
                >
                  {item.text}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}

        {/* Radio */}
        {message.interactive.radio && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 1,
              flexWrap: "wrap",
              px: 1,
              pb: 1,
            }}
          >
            {message.interactive.radio.items.map((item, i) => (
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

        {/* Slider */}
        {message.interactive.slider && (
          <Box sx={{ px: 1, pb: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {message.interactive.slider.label}
            </Typography>
            <Slider
              defaultValue={message.interactive.slider.value}
              min={message.interactive.slider.min}
              max={message.interactive.slider.max}
              step={message.interactive.slider.step}
              onChangeCommitted={(e, val) => console.log("Slider value:", val)}
            />
          </Box>
        )}

        {/* Chips */}
        {message.interactive.chips?.length > 0 && (
          <Box sx={{ px: 1, pb: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {message.interactive.chips.map((chip, i) => {
              const getChipIcon = (type) => {
                switch (type) {
                  case "reply":
                    return <ReplyIcon fontSize="small" />;
                  case "url":
                    return <OpenInNewIcon fontSize="small" />;
                  case "email":
                    return <EmailIcon fontSize="small" />;
                  case "number":
                    return <PhoneIcon fontSize="small" />;
                  default:
                    return null;
                }
              };
              return (
                <Chip
                  key={i}
                  icon={getChipIcon(chip.type)}
                  label={chip.title}
                  clickable
                  color="primary"
                  onClick={() => handleButtonClick(chip, i, "chip")}
                />
              );
            })}
          </Box>
        )}

        {/* Sections (New) */}
        {message.interactive.sections?.length > 0 && (
          <Box sx={{ px: 1, pb: 1 }}>
            {message.interactive.sections.map((section, sIndex) => (
              <Box key={sIndex} sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", color: "text.secondary", mb: 0.5 }}
                >
                  {section.title}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {section.rows.map((row, rIndex) => (
                    <Chip
                      key={rIndex}
                      label={row.title}
                      clickable
                      color="secondary"
                      variant="outlined"
                      onClick={() => handleButtonClick(row, rIndex, "section")}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // ------- Main Content Renderer -------
  const renderContent = () => {
    switch (message.type) {
      case "text":
        return (
          <Box sx={{ p: 1 }}>
            <Typography>{message.text?.body}</Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 1, py: -1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Box>
        );

      case "image":
        return (
          <Card
            sx={{
              maxWidth: 400,
              p: 1,
              bgcolor: config?.botMessage?.bg,
              borderBottom: config?.botMessage?.bg,
            }}
          >
            <CardMedia
              component="img"
              src={message.image?.url}
              alt={message.image?.caption || "Image"}
              onClick={() => openLightbox(message.image?.url, "image")}
              sx={{ cursor: "zoom-in" }}
            />
            {message.image?.caption && (
              <CardContent sx={{ px: 1, py: 1, width: "100%" }}>
                <Typography>{message.image.caption}</Typography>
              </CardContent>
            )}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 1, py: -1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Card>
        );

      case "video":
        return (
          <Card
            sx={{
              maxWidth: 400,
              p: 1,
              bgcolor: config?.botMessage?.bg,
              borderBottom: config?.botMessage?.bg,
            }}
          >
            <CardMedia
              component="video"
              controls
              src={message.video?.url}
              type={message.video?.mime || "video/mp4"}
              onDoubleClick={() => openLightbox(message.video?.url, "video")}
              sx={{ borderRadius: 1 }}
            />
            {message.video?.caption && (
              <CardContent sx={{ py: 1.2 }}>
                <Typography variant="body2">{message.video.caption}</Typography>
              </CardContent>
            )}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 1, py: -1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Card>
        );

      case "audio":
        return (
          <Box
            sx={{
              width: 380,
              p: 1,
            }}
          >
            <AudioPlayer src={message.audio?.url} />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 5, py: -1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Box>
        );

      case "file":
        return (
          <Card
            sx={{
              maxWidth: 400,
              p: 1,
              bgcolor: config?.botMessage?.bg,
              borderBottom: config?.botMessage?.bg,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid #e5e7eb",
                bgcolor: "#f9fafb",
              }}
            >
              <InsertDriveFileIcon />
              <Box sx={{ mr: "auto" }}>
                <Typography fontWeight={600} variant="body2">
                  {message.file?.name || "Download file"}
                </Typography>
              </Box>
              <Tooltip title="Download">
                <IconButton
                  onClick={() => window.open(message.file?.url, "_blank")}
                  size="small"
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 1, py: -1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Card>
        );

      case "contact":
        return (
          <Card
            sx={{
              maxWidth: 400,
              p: 1,
              bgcolor: config?.botMessage?.bg,
              borderBottom: config?.botMessage?.bg,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                gap: 1.2,
                alignItems: "center",
                py: 1.2,
                border: "1px solid #e5e7eb",
                bgcolor: "#f9fafb",
              }}
            >
              <Avatar src={message.contact?.avatar} />
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>
                  {message.contact?.name}
                </Typography>
                <Stack
                  direction="row"
                  // spacing={1.5}
                  sx={{ mt: 0.5, flexWrap: "wrap" }}
                >
                  {message.contact?.phone && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.3,
                        bgcolor: "#f1f3f4",
                        borderRadius: 20,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#e0e0e0" },
                      }}
                      onClick={() =>
                        window.open(`tel:${message.contact.phone}`)
                      }
                    >
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2">
                        {message.contact.phone}
                      </Typography>
                    </Box>
                  )}

                  {message.contact?.email && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.3,
                        bgcolor: "#f1f3f4",
                        borderRadius: 20,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#e0e0e0" },
                      }}
                      onClick={() =>
                        window.open(`mailto:${message.contact.email}`)
                      }
                    >
                      <EmailIcon fontSize="small" />
                      <Typography variant="body2">
                        {message.contact.email}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 1, py: 0.5 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Card>
        );

      case "location": {
        const { name, address } = message.location || {};
        return (
          <Card
            sx={{
              maxWidth: 400,
              p: 1,
              bgcolor: config?.botMessage?.bg,
              borderBottom: config?.botMessage?.bg,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid #e5e7eb",
                bgcolor: "#f9fafb",
              }}
            >
              <PlaceIcon />
              <Box sx={{ mr: "auto", minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>
                  {name || "Location"}
                </Typography>
                {address && (
                  <Typography variant="caption" sx={{ opacity: 0.75 }} noWrap>
                    {address}
                  </Typography>
                )}
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  handleButtonClick({
                    type: "location",
                    location: message.location,
                  })
                }
              >
                Open
              </Button>
            </CardContent>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 1, py: 0.5 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Card>
        );
      }

      case "interactive":
        return renderInteractive();

      case "notification":
        return (
          <Typography sx={{ fontStyle: "italic", opacity: 0.85 }}>
            {message.notification?.body}
          </Typography>
        );

      case "sticker":
        return (
          <Box
            sx={{
              maxWidth: 180,
              // borderRadius: 2,
              overflow: "hidden",
              bgcolor: config?.botMessage?.bg,
              borderBottomLeftRadius: "25px",
              borderBottomRightRadius: "25px",
            }}
          >
            <Box
              component="img"
              src={message.sticker?.url}
              alt="Sticker"
              sx={{
                display: "block",
                width: "95%",
                height: "auto",
                cursor: "default",
                transform: "translate(4px, 4px)",
              }}
            />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ px: 1, py: 0.5 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {formatTime(ts, { format: "hh:mm A" })}
              </Typography>
            </Stack>
          </Box>
        );

      default:
        return "[Unsupported message type]";
    }
  };

  // ------- Message Meta (time + ticks placeholder) -------
  const renderMeta = () => {
    // You can wire status from message.status: 'sent' | 'delivered' | 'read'
    const status = message?.status;
    return (
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent="flex-end"
      >
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          {formatTime(ts, { format: "hh:mm A" })}
        </Typography>
        {status === "sent" && <CheckIcon sx={{ fontSize: 14, opacity: 0.6 }} />}
        {status === "delivered" && (
          <DoneAllIcon sx={{ fontSize: 14, opacity: 0.6 }} />
        )}
        {status === "read" && (
          <DoneAllIcon color="primary" sx={{ fontSize: 14, opacity: 0.9 }} />
        )}
      </Stack>
    );
  };

  // ------- Render -------
  return (
    <Box display="flex" justifyContent="flex-start" mb={1.25}>
      <Box onContextMenu={openContext} sx={bubbleSx}>
        {renderContent()}
        {/* <Box sx={{ mt: 0.5 }}>{renderMeta()}</Box> */}

        {/* Context Menu (right-aligned) */}
        <Menu
          anchorEl={contextAnchor}
          open={Boolean(contextAnchor)}
          onClose={closeContext}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {canCopy && (
            <MenuItem onClick={copyText}>
              <ContentCopyIcon fontSize="small" style={{ marginRight: 8 }} />
              Copy
            </MenuItem>
          )}
          {getPrimaryMediaUrl() && (
            <MenuItem onClick={openOrDownload}>
              <DownloadIcon fontSize="small" style={{ marginRight: 8 }} />
              Download
            </MenuItem>
          )}
          {(getPrimaryMediaUrl() || canCopy) && <Divider />}

          <MenuItem
            onClick={() => {
              console.log("Reply to:", message);
              closeContext();
            }}
          >
            <ReplyIcon fontSize="small" style={{ marginRight: 8 }} />
            Reply
          </MenuItem>
          <Divider />
          <MenuItem onClick={showInfo}>
            <InfoOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
            Message Info
          </MenuItem>
        </Menu>
      </Box>

      {/* Media Lightbox */}
      <Dialog
        open={lightbox.open}
        onClose={closeLightbox}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 1, display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Preview
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {lightbox.url && (
              <>
                <Tooltip title="Open in new tab">
                  <IconButton
                    onClick={() => window.open(lightbox.url, "_blank")}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download / Open">
                  <IconButton
                    onClick={() => window.open(lightbox.url, "_blank")}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          <Divider />
          <Box sx={{ p: 1.5 }}>
            {lightbox.type === "image" && (
              <img
                src={lightbox.url}
                alt="preview"
                style={{ width: "100%", height: "auto", borderRadius: 8 }}
              />
            )}
            {lightbox.type === "video" && (
              <video
                src={lightbox.url}
                controls
                style={{ width: "100%", borderRadius: 8, display: "block" }}
              />
            )}
            {lightbox.type === "document" && (
              <Stack spacing={1} alignItems="center" sx={{ py: 2 }}>
                <InsertDriveFileIcon />
                <Button
                  variant="contained"
                  onClick={() => window.open(lightbox.url, "_blank")}
                >
                  Open Document
                </Button>
              </Stack>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
