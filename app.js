const API_URL = "https://restless-lake-15cc.a-singhhemant2006.workers.dev/";

const messages = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("promptInput");
const micButton = document.getElementById("micButton");
const voiceState = document.getElementById("voiceState");
const clearButton = document.getElementById("clearButton");

// Conversation memory for this open session
let chatHistory = [];

// Browser voice setup
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

// JARVIS voice output
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

// Direct voice test button
const testButton = document.createElement("button");
testButton.type = "button";
testButton.textContent = "🔊 Test JARVIS Voice";

testButton.style.cssText =
  "display:block;margin:12px auto;padding:12px 20px;border-radius:12px;border:1px solid #64d9ff;background:#102b40;color:white;cursor:pointer;";

micButton.parentElement.insertBefore(testButton, micButton);

testButton.addEventListener("click", () => {
  speak("Hello. JARVIS voice system is working. How can I help you?");
});

// Display chat messages
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

// Send message to Gemini through Cloudflare
async function askJARVIS(text) {
  const conversation = [
    ...chatHistory,
    { role: "user", content: text }
  ].slice(-20);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: conversation
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  if (!data.reply) {
    throw new Error("JARVIS received an empty response.");
  }

  chatHistory = [
    ...conversation,
    { role: "assistant", content: data.reply }
  ].slice(-20);

  return data.reply;
}

// Chat submission
form.addEventListener("submit", async event => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";
  input.disabled = true;

  voiceState.textContent = "JARVIS IS THINKING...";

  try {
    const answer = await askJARVIS(text);

    addMessage("assistant", answer);
    speak(answer);

  } catch (error) {
    console.error("JARVIS error:", error);

    const message = "I couldn't connect to my AI brain. " + error.message;
    addMessage("assistant", message);
    voiceState.textContent = "CONNECTION ERROR";

  } finally {
    input.disabled = false;
    input.focus();
  }
});

// Clear conversation
clearButton.addEventListener("click", () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  chatHistory = [];
  messages.replaceChildren();

  addMessage("assistant", "Conversation cleared. I'm ready.");
  voiceState.textContent = "READY WHEN YOU ARE";
});

// Microphone recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

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
