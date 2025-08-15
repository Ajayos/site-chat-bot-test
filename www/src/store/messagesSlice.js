import { createSlice, nanoid, createSelector } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const STORAGE_KEY = "chat_messages_v1";

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // ensure ts is ISO and id present
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const initialState = {
  items: loadMessages(), // [{id, from:'user'|'bot'|'system', text, status?, ts}]
  isTyping: false,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ ...msg }) {
        return {
          payload: {
            id: nanoid(),
            ts: new Date().toISOString(),
            ...msg,
          },
        };
      },
    },
    clearMessages(state) {
      state.items = [];
    },
    setTyping(state, action) {
      state.isTyping = Boolean(action.payload);
    },
    // for migrations, replacements if needed
    setAllMessages(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const { addMessage, clearMessages, setTyping, setAllMessages } =
  messagesSlice.actions;

export default messagesSlice.reducer;

// selectors
export const selectMessages = (state) => state.messages.items;
export const selectIsTyping = (state) => state.messages.isTyping;

// ordered messages by ts
export const selectMessagesOrdered = createSelector([selectMessages], (items) =>
  [...items].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
);

// Grouped by date string
export const selectMessagesByDate = createSelector(
  [selectMessagesOrdered],
  (ordered) => {
    const groups = [];
    let currentDate = null;
    ordered.forEach((m) => {
      const d = dayjs(m.ts).format("MMM D, YYYY"); // date header
      if (d !== currentDate) {
        currentDate = d;
        groups.push({
          from: "system",
          type: "date",
          id: `date-${currentDate}`,
          label: currentDate,
        });
      }
      groups.push(m);
    });
    return groups;
  }
);

// persistence middleware factory
export const persistMessagesMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);
  const { type } = action;
  if (
    type.startsWith("messages/") &&
    !type.endsWith("setTyping") // do not persist typing
  ) {
    const state = storeAPI.getState();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages.items));
    } catch {}
  }
  return result;
};
