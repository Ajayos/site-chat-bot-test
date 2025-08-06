(function () {
  const CHAT_URL = "https://ajayos.in/site-chat-bot-test/build/";

  // Create style for widget
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

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.className = "chatbot-frame";
  iframe.src = CHAT_URL;
  document.body.appendChild(iframe);

  // Create button
  const button = document.createElement("button");
  button.className = "chatbot-btn";
  button.innerHTML = "💬";
  button.onclick = () => {
    iframe.style.display = iframe.style.display === "none" ? "block" : "none";
  };
  document.body.appendChild(button);
})();
