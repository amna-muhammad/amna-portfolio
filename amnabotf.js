document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  // If any element is missing, stop quietly (prevents script crash)
  if (!chatWindow || !chatToggleBtn || !chatForm || !chatInput || !chatMessages) {
    console.log("Chatbot elements missing. Check IDs.");
    return;
  }

  let isChatOpen = false;

  function toggleChat() {
    isChatOpen = !isChatOpen;

    if (isChatOpen) {
      chatWindow.classList.remove("hidden");
      setTimeout(() => {
        chatWindow.classList.remove("scale-0", "opacity-0");
        chatWindow.classList.add("scale-100", "opacity-100");
      }, 10);
      chatToggleBtn.classList.add("scale-0");
    } else {
      chatWindow.classList.remove("scale-100", "opacity-100");
      chatWindow.classList.add("scale-0", "opacity-0");
      setTimeout(() => {
        chatWindow.classList.add("hidden");
        chatToggleBtn.classList.remove("scale-0");
      }, 300);
    }
  }

  // Make it work with onclick="toggleChat()"
  window.toggleChat = toggleChat;

  function addMessage(text, sender, isTemp = false) {
    const div = document.createElement("div");
    const id = "m_" + Date.now() + Math.random().toString(16).slice(2);
    div.dataset.msgid = id;

    const isBot = sender === "bot";
    div.className = `flex items-start gap-2 ${isBot ? "" : "flex-row-reverse"}`;

    const avatar = isBot
      ? `<div class="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center text-[10px] text-white">AI</div>`
      : `<div class="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white">ME</div>`;

    const bubble = isBot ? `bg-white/10 text-white` : `bg-pink-600 text-white`;

    div.innerHTML = `
      ${avatar}
      <div class="${bubble} p-3 rounded-2xl ${isBot ? "rounded-tl-none" : "rounded-tr-none"} text-sm border border-white/10 backdrop-blur-md max-w-[80%]">
        ${String(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
      </div>
    `;

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (isTemp) return id;
    return null;
  }

  function removeTempMessage(id) {
    if (!id) return;
    const el = chatMessages.querySelector(`[data-msgid="${id}"]`);
    if (el) el.remove();
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const raw = chatInput.value.trim();
    if (!raw) return;

    addMessage(raw, "user");
    chatInput.value = "";

    const typingId = addMessage("Typing...", "bot", true);

    try {
      const res = await fetch("/.netlify/functions/amnabot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: raw })
      });

      if (!res.ok) {
        removeTempMessage(typingId);
        addMessage("No reply received", "bot");
        return;
      }

      const data = await res.json();
      removeTempMessage(typingId);
      addMessage(data.reply || "No reply received", "bot");
    } catch (err) {
      removeTempMessage(typingId);
      addMessage("No reply received", "bot");
    }
  });
});
