const messages = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("promptInput");
const micButton = document.getElementById("micButton");
const voiceState = document.getElementById("voiceState");

function addMessage(role, text) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  const sender = document.createElement("span");
  sender.className = "sender";
  sender.textContent = role === "user" ? "YOU" : "JARVIS";
  const p = document.createElement("p");
  p.textContent = text;
  article.append(sender, p);
  messages.appendChild(article);
  messages.scrollTop = messages.scrollHeight;
}

function demoReply(text) {
  const q = text.toLowerCase();
  if (q.includes("time") || q.includes("date")) return "I don't have live device time access in this demo yet. We'll add Android integrations in a later stage.";
  if (q.includes("who are you") || q.includes("your name")) return "I am JARVIS, your personal assistant project. This starter build provides the interface; the live AI brain is not connected yet.";
  if (q.includes("help") || q.includes("what can you do")) return "Right now I can demonstrate text chat and supported browser speech input. Next we'll connect an AI backend, memory, vision and approved Android actions.";
  return "I received your message. My AI connection is not configured yet, so I can't answer that intelligently. The next stage will connect a secure backend and an AI model.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";
  window.setTimeout(() => addMessage("assistant", demoReply(text)), 250);
});

document.getElementById("clearButton").addEventListener("click", () => {
  messages.replaceChildren();
  addMessage("assistant", "Conversation cleared. Ready for a new test.");
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => voiceState.textContent = "LISTENING…";
  recognition.onend = () => voiceState.textContent = "READY WHEN YOU ARE";
  recognition.onerror = (event) => voiceState.textContent = `VOICE ERROR: ${event.error}`;
  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    form.requestSubmit();
  };
  micButton.addEventListener("click", () => {
    try { recognition.start(); } catch (_) { voiceState.textContent = "PLEASE WAIT AND TRY AGAIN"; }
  });
} else {
  micButton.addEventListener("click", () => {
    voiceState.textContent = "VOICE INPUT NOT SUPPORTED IN THIS BROWSER";
    addMessage("assistant", "Speech recognition isn't available in this browser. Try Chrome, or use the keyboard for now.");
  });
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
