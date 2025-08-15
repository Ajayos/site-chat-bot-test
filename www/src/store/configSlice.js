import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  header: {
    text: "AOS",
    icon: "https://github.com/Ajay-o-s.png",
    color: "#05c9faff",
    textColor: "#ffffff",
    font: "'Poppins', sans-serif",
    fontWeight: 600,
  },
  body: {
    bg: "#F5F7FA",
    font: "'Poppins', sans-serif",
  },
  userMessage: {
    bg: "#4A90E2",
    textColor: "#ffffff",
  },
  botMessage: {
    bg: "#EDEDED",
    textColor: "#000000",
  },
  systemMessage: {
    info: "#2196f3",
    warning: "#ff9800",
    success: "#4caf50",
    error: "#f44336",
  },
  footer: {
    color: "#ffffff",
  },
  input: {
    placeholder: "Ask me anything...",
  },
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    updateConfig(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateConfig } = configSlice.actions;
export default configSlice.reducer;
