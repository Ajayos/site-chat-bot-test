import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "./store/store";
import Header from "./views/Header";
import Body from "./views/Body";
import Footer from "./views/Footer";
import Box from "@mui/material/Box";
import { ChatProvider, useChat } from "./context/ChatContext";

function ChatShell() {
  const config = useSelector((s) => s.config);
  const { sendSystem, sendBot, setIsTyping } = useChat();

  // Example handlers for Header menu
  const handleCloseChat = () => {
    // Up to you: hide widget, navigate, etc.
    sendSystem("Chat closed by user");
  };

  // Hook: simulate bot typing when any user message is sent
  // A quick way: listen to document-level custom event
  useEffect(() => {
    const onUserSent = (e) => {
      // start typing
      setIsTyping(true);
      // fake reply
      setTimeout(() => {
        setIsTyping(false);
        sendBot(`Bot received: "${e.detail?.text || ""}"`);
      }, 1200);
    };
    window.addEventListener("chat:user-sent", onUserSent);
    return () => window.removeEventListener("chat:user-sent", onUserSent);
  }, [setIsTyping, sendBot]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ bgcolor: config.body.bg }}
    >
      <Header onCloseChat={handleCloseChat} />
      <Body />
      <Footer
        onFileUpload={(file) => {
          sendSystem(`File attached: ${file.name}`, "info");
        }}
        onVoiceSend={() => {
          sendSystem("Voice message recorded", "info");
        }}
      />
    </Box>
  );
}

// Wrap Footer's sendMessage to also dispatch an event (so typing/bot works)
function EventsBridge() {
  const { sendMessage } = useChat();

  useEffect(() => {
    // Monkey-patch a global helper so Footer can continue to just call sendMessage normally.
    // If you prefer, you can pass a prop to Footer instead.
    window.__chat_send = (text) => {
      sendMessage(text);
      const event = new CustomEvent("chat:user-sent", { detail: { text } });
      window.dispatchEvent(event);
    };
  }, [sendMessage]);

  return null;
}

function AppInner() {
  const { setIsTyping } = useChat();
  // keep typing reset on unmount just in case
  useEffect(() => () => setIsTyping(false), [setIsTyping]);
  return (
    <>
      <EventsBridge />
      <ChatShell />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ChatProvider>
        <AppInner />
      </ChatProvider>
    </Provider>
  );
}
