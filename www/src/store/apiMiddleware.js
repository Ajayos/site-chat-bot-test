// apiMiddleware.js
export const sendMessageApiMiddleware =
  (storeAPI) => (next) => async (action) => {
    // Pass action to reducers first
    const result = next(action);

    if (
      action.type === "messages/addMessage" &&
      action.payload.from === "user"
    ) {
      // Get backend domain from config in Redux
      const state = storeAPI.getState();
      const API_BASE = state.config?.domain || "http://localhost:5000/";
      const API_URL = `${API_BASE}api/chat`;

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload),
        });

        const data = await res.json();

        storeAPI.dispatch({
          type: "messages/addMessage",
          payload: data,
        });
      } catch (err) {
        console.error("API error:", err);

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
