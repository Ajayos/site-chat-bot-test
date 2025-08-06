(function () {
  const CHAT_URL = "https://ajayos.in/site-chat-bot-test/build/";

  function injectWidget() {
    if (document.querySelector(".chatbot-btn") || document.querySelector(".chatbot-frame")) {
      console.log("[Chatbot] Widget already exists, skipping inject.");
      return;
    }

    console.log("[Chatbot] Injecting widget...");

    // Create style
    const style = document.createElement("style");
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

    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.className = "chatbot-frame";
    iframe.src = CHAT_URL;
    iframe.onload = () => console.log("[Chatbot] Iframe loaded:", CHAT_URL);
    document.body.appendChild(iframe);

    // Create button
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

  function initWidget() {
    console.log("[Chatbot] Waiting for full page load...");

    // Wait a bit after page load to avoid Angular/React overwrites
    setTimeout(() => {
      injectWidget();

      // Keep checking every 3 seconds to re-inject if DOM changes
      setInterval(() => {
        injectWidget();
      }, 3000);
    }, 2000); // 2 second delay after DOM ready
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initWidget();
  } else {
    document.addEventListener("DOMContentLoaded", initWidget);
  }
})();
