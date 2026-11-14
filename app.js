const messages = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("promptInput");
const micButton = document.getElementById("micButton");
const voiceState = document.getElementById("voiceState");

// Load Android/browser voices
let availableVoices = [];

function loadVoices() {
  availableVoices = window.speechSynthesis
    ? window.speechSynthesis.getVoices()
    : [];
}

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// JARVIS speech output
function speak(text) {
  if (!("speechSynthesis" in window)) {
    voiceState.textContent = "SPEECH NOT SUPPORTED";
    return;
  }

  window.speechSynthesis.cancel();
  loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.9;
  utterance.pitch = 0.85;
  utterance.volume = 1;

  const voice =
    availableVoices.find(v => v.lang === "en-IN") ||
    availableVoices.find(v => v.lang.startsWith("en"));

  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    voiceState.textContent = "JARVIS SPEAKING...";
  };

  utterance.onend = () => {
    voiceState.textContent = "READY WHEN YOU ARE";
  };

  utterance.onerror = event => {
    voiceState.textContent = "SPEECH ERROR: " + event.error;
  };

  window.speechSynthesis.speak(utterance);
}

// Add a direct voice test button
const testButton = document.createElement("button");
testButton.textContent = "🔊 Test JARVIS Voice";
testButton.style.cssText =
  "display:block;margin:12px auto;padding:12px 20px;border-radius:12px;border:1px solid #64d9ff;background:#102b40;color:white;cursor:pointer;";

micButton.parentElement.insertBefore(testButton, micButton);

testButton.addEventListener("click", () => {
  speak("Hello. JARVIS voice system is working. How can I help you?");
});

// Chat messages
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

function getReply(text) {
  const q = text.toLowerCase();

  if (q.includes("who are you")) {
    return "I am JARVIS, your personal AI assistant.";
  }

  if (q.includes("hello") || q.includes("hi")) {
    return "Hello! I am ready to assist you.";
  }

  return "I received your message. My advanced AI brain is not connected yet.";
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  const answer = getReply(text);

  addMessage("assistant", answer);
  speak(answer);
});

document.getElementById("clearButton").addEventListener("click", () => {
  window.speechSynthesis?.cancel();
  messages.replaceChildren();
  addMessage("assistant", "Conversation cleared.");
  voiceState.textContent = "READY WHEN YOU ARE";
});

// Voice recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;

  recognition.onstart = () => {
    voiceState.textContent = "LISTENING...";
  };

  recognition.onresult = event => {
    input.value = event.results[0][0].transcript;
    form.requestSubmit();
  };

  recognition.onerror = event => {
    voiceState.textContent = "MIC ERROR: " + event.error;
  };

  recognition.onend = () => {
    if (!window.speechSynthesis?.speaking) {
      voiceState.textContent = "READY WHEN YOU ARE";
    }
  };

  micButton.addEventListener("click", () => {
    try {
      recognition.start();
    } catch (error) {
      voiceState.textContent = "TRY AGAIN";
    }
  });
} else {
  micButton.addEventListener("click", () => {
    voiceState.textContent = "MIC NOT SUPPORTED";
  });
}
