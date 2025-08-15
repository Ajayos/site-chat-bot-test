// apiMiddleware.js
export const sendMessageApiMiddleware =
  (storeAPI) => (next) => async (action) => {
    // Pass action to reducers first
    const result = next(action);

    // Only trigger API if the message is from the user
    if (
      action.type === "messages/addMessage" &&
      action.payload.from === "user"
    ) {
      const messageText =
        action.payload.text?.body || action.payload.text || "";

      try {
        const res = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        });

        const data = await res.json();

        // Send bot reply using full meta format from API
        storeAPI.dispatch({
          type: "messages/addMessage",
          payload: data,
        });
      } catch (err) {
        console.error("API error:", err);

        // Send system error message in meta format
        storeAPI.dispatch({
          type: "messages/addMessage",
          payload: {
            id: crypto.randomUUID(),
            from: "system",
            type: "notification",
            notification: { body: "⚠️ Failed to get response from server." },
            status: "error",
            ts: new Date().toISOString(),
          },
        });
      }
    }

    return result;
  };
