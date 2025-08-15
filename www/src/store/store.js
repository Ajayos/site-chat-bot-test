import { configureStore } from "@reduxjs/toolkit";
import configReducer from "./configSlice";
import messagesReducer, { persistMessagesMiddleware } from "./messagesSlice";
import { sendMessageApiMiddleware } from "./apiMiddleware";

export const store = configureStore({
  reducer: {
    config: configReducer,
    messages: messagesReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(persistMessagesMiddleware, sendMessageApiMiddleware),
});
