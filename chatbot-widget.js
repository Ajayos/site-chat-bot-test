(function () {
  const CHAT_URL = "https://ajayos.in/site-chat-bot-test/my-chatbot/build/";

  function injectWidget() {
    if (document.querySelector(".chatbot-btn") || document.querySelector(".chatbot-frame")) {
      return; // already there
    }

    console.log("[Chatbot] Injecting widget...");

    // Style
    if (!document.getElementById("chatbot-style")) {
      const style = document.createElement("style");
      style.id = "chatbot-style";
      style.innerHTML = `
        .chatbot-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: #007bff;
          color: white;
          font-size: 28px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 99999;
        }
        .chatbot-frame {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 350px;
          height: 500px;
          border: none;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 99999;
          display: none;
        }
      `;
      document.head.appendChild(style);
      console.log("[Chatbot] Styles injected.");
    }

    // Iframe
    const iframe = document.createElement("iframe");
    iframe.className = "chatbot-frame";
    iframe.src = CHAT_URL;
    iframe.onload = () => console.log("[Chatbot] Iframe loaded:", CHAT_URL);
    document.body.appendChild(iframe);

    // Button
    const button = document.createElement("button");
    button.className = "chatbot-btn";
    button.innerHTML = "💬";
    button.onclick = () => {
      const isHidden = iframe.style.display === "none";
      iframe.style.display = isHidden ? "block" : "none";
      console.log(`[Chatbot] Chat ${isHidden ? "opened" : "closed"}`);
    };
    document.body.appendChild(button);

    console.log("[Chatbot] Widget added to page.");
  }

  function startObserver() {
    console.log("[Chatbot] Starting MutationObserver...");
    const observer = new MutationObserver(() => {
      if (!document.querySelector(".chatbot-btn") || !document.querySelector(".chatbot-frame")) {
        console.log("[Chatbot] Widget missing — re-injecting...");
        injectWidget();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initWidget() {
    console.log("[Chatbot] Waiting for page to stabilize...");
    setTimeout(() => {
      injectWidget();
      startObserver();
    }, 10000); // wait 10s after DOM ready
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initWidget();
  } else {
    document.addEventListener("DOMContentLoaded", initWidget);
  }
})();
