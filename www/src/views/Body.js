import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { selectMessagesByDate, selectIsTyping } from "../store/messagesSlice";

import UserMessage from "./messages/UserMessage";
import BotMessage from "./messages/BotMessage";
import CenterMessage from "./messages/CenterMessage";

export default function Body() {
  const config = useSelector((s) => s.config);
  const messages = useSelector(selectMessagesByDate);
  const isTyping = useSelector(selectIsTyping);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages, isTyping]);

  const getBgStyle = () => {
    const bg = config.body.bg;
    return bg?.startsWith("http") || bg?.startsWith("data:")
      ? {
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: bg || "#f8f8f8" };
  };

  // Animated wrapper for messages with alignment
  const AnimatedMessage = ({ children, fadeOnly = false, id, from }) => {
    let justify = "start"; // default left
    if (from === "user")
      justify = "end"; // right
    else if (from === "system")
      justify = "center"; // center
    else justify = "start"; // bot left

    return (
      <motion.div
        key={id}
        initial={fadeOnly ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={fadeOnly ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ width: "fit-content", justifySelf: justify }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <Box
      flex={1}
      p={2}
      overflow="auto"
      ref={chatBodyRef}
      sx={{
        display: "grid",
        gridAutoRows: "min-content",
        gridTemplateColumns: "1fr",
        gap: "8px",
        ...getBgStyle(),
      }}
    >
      {messages.map((m) => {
        if (m.from === "user") {
          return (
            <AnimatedMessage key={m.id} id={m.id} from="user">
              <UserMessage message={m} config={config} />
            </AnimatedMessage>
          );
        }

        if (m.from === "bot") {
          return (
            <AnimatedMessage key={m.id} id={m.id} from="bot">
              <BotMessage message={m} config={config} />
            </AnimatedMessage>
          );
        }

        if (m.from === "system") {
          return (
            <AnimatedMessage key={m.id} id={m.id} from="system">
              <CenterMessage message={m} config={config} />
            </AnimatedMessage>
          );
        }

        return (
          <AnimatedMessage key={m.id} fadeOnly id={m.id} from="system">
            <CenterMessage
              type={m.type || m.status}
              text={m.label || m.text}
              ts={m.ts}
              config={config}
            />
          </AnimatedMessage>
        );
      })}

      {isTyping && (
        <Box display="flex" justifyContent="flex-start">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.6,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: config.botMessage.textColor,
                fontFamily: config.body.font,
                opacity: 0.8,
              }}
            >
              Bot is typing...
            </Typography>
          </motion.div>
        </Box>
      )}
    </Box>
  );
}
