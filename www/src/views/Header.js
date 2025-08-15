import React, { useState } from "react";
import { useSelector } from "react-redux";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useChat } from "../context/ChatContext";

export default function Header() {
  const config = useSelector((state) => state.config);
  const { clearChat, closeChat } = useChat();
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: config.header.color || "#1976d2",
        color: config.header.textColor || "#fff",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {config.header.icon && (
            <Avatar src={config.header.icon} alt="icon" sx={{ mr: 1 }} />
          )}
          <Typography
            variant="h6"
            sx={{
              fontFamily: config.header.font,
              fontWeight: config.header.fontWeight,
            }}
          >
            {config.header.text}
          </Typography>
        </div>

        <div>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                clearChat();
              }}
            >
              Clear Chat
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                closeChat();
              }}
            >
              Close Chat
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}
