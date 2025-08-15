(function () {
  const CHAT_URL = "https://ajayos.in/site-chat-bot-test/www/build/";

  function injectWidget() {
    if (document.querySelector(".chatbot-btn") || document.querySelector(".chatbot-frame")) {
      return; // already there
    }

    console.log("[Chatbot] Injecting movable button + fixed chat...");

    // Styles
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
          cursor: grab;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 99999;
          user-select: none;
        }
        .chatbot-btn:active {
          cursor: grabbing;
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
          z-index: 99998;
          display: none;
        }
      `;
      document.head.appendChild(style);
      console.log("[Chatbot] Styles injected.");
    }

    // Iframe (Fixed Position)
    const iframe = document.createElement("iframe");
    iframe.className = "chatbot-frame";
    iframe.src = CHAT_URL;
    iframe.onload = () => console.log("[Chatbot] Iframe loaded:", CHAT_URL);
    document.body.appendChild(iframe);

    // Button (Movable)
    const button = document.createElement("button");
    button.className = "chatbot-btn";
    button.innerHTML = "💬";
    document.body.appendChild(button);

    // Toggle chat visibility
    button.addEventListener("click", (e) => {
      if (e.detail === 0) return; // ignore drag clicks
      const isHidden = iframe.style.display === "none" || iframe.style.display === "";
      iframe.style.display = isHidden ? "block" : "none";
      console.log(`[Chatbot] Chat ${isHidden ? "opened" : "closed"}`);
    });

    // Dragging logic for button only
    let offsetX, offsetY, isDragging = false;

    button.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - button.getBoundingClientRect().left;
      offsetY = e.clientY - button.getBoundingClientRect().top;
      button.style.transition = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;
      left = Math.max(0, Math.min(window.innerWidth - button.offsetWidth, left));
      top = Math.max(0, Math.min(window.innerHeight - button.offsetHeight, top));
      button.style.left = left + "px";
      button.style.top = top + "px";
      button.style.right = "auto";
      button.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        button.style.transition = "all 0.2s";
      }
    });

    console.log("[Chatbot] Movable button + fixed chat added.");
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
    }, 2000); // wait 2s
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initWidget();
  } else {
    document.addEventListener("DOMContentLoaded", initWidget);
  }
})();
