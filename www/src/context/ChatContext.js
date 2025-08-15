// ChatContext.js
import { createContext, useContext, useCallback } from "react";
import { useDispatch } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { addMessage, clearMessages, setTyping } from "../store/messagesSlice";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const dispatch = useDispatch();

  const sendMessage = useCallback(
    (msg) => {
      dispatch(setTyping(true));
      setTimeout(() => {
        dispatch(setTyping(false));
        dispatch(addMessage(msg));
      }, 300);
    },
    [dispatch]
  );

  const setIsTyping = useCallback(
    (val) => dispatch(setTyping(val)),
    [dispatch]
  );

  const clearChat = useCallback(() => {
    dispatch(clearMessages());
    dispatch(
      addMessage({
        id: nanoid(),
        ts: new Date().toISOString(),
        from: "system",
        type: "notification",
        notification: { body: "Chat history has been cleared." },
        status: "info",
      })
    );
  }, [dispatch]);

  const closeChat = useCallback(() => {
    dispatch(clearMessages());
    dispatch(
      addMessage({
        id: nanoid(),
        from: "system",
        type: "notification",
        notification: { body: "Chat has been closed." },
        status: "info",
        ts: new Date().toISOString(),
      })
    );
  }, [dispatch]);

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        clearChat,
        setIsTyping,
        closeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
