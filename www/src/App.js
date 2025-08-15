import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store/store";
import Header from "./views/Header";
import Body from "./views/Body";
import Footer from "./views/Footer";
import Box from "@mui/material/Box";
import { ChatProvider, useChat } from "./context/ChatContext";
import { loadConfig } from "./config";
import { updateConfig } from "./store/configSlice";

function ChatShell() {
  const dispatch = useDispatch();
  const config = useSelector((s) => s.config);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Step 1: Get API URL from public/config.json
        const { API_URL } = await loadConfig();
        console.log(window.location.origin);

        // Step 2: Fetch backend config and body have window.location
        const res = await fetch(`${API_URL}api/config`, {
          method: "POST",
          body: JSON.stringify({ domain: window.location.origin }),
        });
        const data = await res.json();

        // Step 3: Update Redux
        dispatch(updateConfig(data));

        setIsReady(true);
      } catch (err) {
        console.error("Config load error:", err);
      }
    })();
  }, [dispatch]);

  if (!isReady) return null; // wait until config is loaded

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ bgcolor: config.body.bg }}
    >
      <Header />
      <Body />
      <Footer />
    </Box>
  );
}

function EventsBridge() {
  const { sendMessage } = useChat();
  useEffect(() => {
    window.__chat_send = (text) => {
      sendMessage(text);
      window.dispatchEvent(
        new CustomEvent("chat:user-sent", { detail: { text } })
      );
    };
  }, [sendMessage]);
  return null;
}

function AppInner() {
  const { setIsTyping } = useChat();
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
