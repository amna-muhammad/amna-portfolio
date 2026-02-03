const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = who === "user" ? "msg user" : "msg bot";
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMsg(message, "user");
  input.value = "";

  addMsg("Typing...", "bot");
  const typingEl = chat.lastChild;

  try {
    const res = await fetch("/.netlify/functions/amnabot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    typingEl.remove();
    addMsg(data.reply || "No reply received.", "bot");
  } catch (err) {
    typingEl.remove();
    addMsg("Error connecting to bot.", "bot");
  }
});
