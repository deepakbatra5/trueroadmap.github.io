const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const roleSelect = document.getElementById("role");
const themeSelect = document.getElementById("themeSelect");

const THEME_STORAGE_KEY = "expert-hub-theme";
const RUNTIME_API_URL = (window.EXPERT_HUB_API_URL || "").trim();

function resolveApiUrl() {
  const { protocol, hostname } = window.location;

  if (protocol === "file:") {
    return "http://localhost:3000/api/chat";
  }

  return "/api/chat";
}

const CHAT_API_URL = resolveApiUrl();

let chatHistory = [];

function addMessage(text, type, extraClass = "") {
  const item = document.createElement("div");
  item.className = `message ${type} ${extraClass}`.trim();
  item.textContent = text;
  chatBox.appendChild(item);
  chatBox.scrollTop = chatBox.scrollHeight;
  return item;
}

function typeBotMessage(markdownText) {
  return new Promise((resolve) => {
    const item = document.createElement("div");
    item.className = "message bot";
    chatBox.appendChild(item);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    let i = 0;
    const speed = 15;
    const charsPerTick = 3;
    const textLength = (markdownText || "").length;
    
    if (textLength === 0) {
      item.innerHTML = "<p>No response received.</p>";
      resolve(item);
      return;
    }

    const interval = setInterval(() => {
      i += charsPerTick;
      if (i >= textLength) {
        i = textLength;
        clearInterval(interval);
      }
      
      const currentText = markdownText.slice(0, i);
      const rawHtml = typeof marked !== 'undefined' ? marked.parse(currentText) : "<p>" + currentText + "</p>";
      const safeHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml;
      
      item.innerHTML = safeHtml;
      chatBox.scrollTop = chatBox.scrollHeight;
      
      if (i >= textLength) {
        resolve(item);
      }
    }, speed);
  });
}

function addBotMessage(markdownText) {
  const item = document.createElement("div");
  item.className = "message bot";
  const rawHtml = typeof marked !== 'undefined' ? marked.parse(markdownText || "") : "<p>" + markdownText + "</p>";
  const safeHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml;
  item.innerHTML = safeHtml || "<p>No response received.</p>";
  chatBox.appendChild(item);
  chatBox.scrollTop = chatBox.scrollHeight;
  return item;
}

function setTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem(THEME_STORAGE_KEY, themeName);
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = saved || "midnight";
  themeSelect.value = theme;
  setTheme(theme);
}

async function sendMessage(messageText) {
  const message = messageText.trim();
  if (!message) {
    return;
  }

  addMessage(message, "user");
  messageInput.value = "";
  sendBtn.disabled = true;

  const pending = addMessage("Thinking...", "bot", "loading");

  if (!CHAT_API_URL) {
    pending.remove();
    addBotMessage("### Backend Not Connected Yet\n\nYour frontend is live on GitHub Pages, but the backend API URL is not configured.\n\n1. Add the `EXPERT_HUB_API_URL` secret in GitHub Actions settings.\n2. Set it to your deployed backend endpoint, for example `https://your-backend-domain.com/chat`.\n3. Re-run the `Deploy Frontend to GitHub Pages` workflow.\n\nAfter that, chat will work normally.");
    sendBtn.disabled = false;
    messageInput.focus();
    return;
  }

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, role: roleSelect.value, history: chatHistory })
    });

    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }

    const data = await res.json();
    pending.remove();
    if (data.reply) {
      await typeBotMessage(data.reply);
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "assistant", content: data.reply });
    } else {
      addBotMessage("No response received.");
    }
  } catch (err) {
    pending.remove();
    addMessage("Unable to connect to the assistant right now. Please try again.", "bot");
    console.error(err);
  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

roleSelect.addEventListener("change", (event) => {
  chatBox.innerHTML = "";
  chatHistory = [];
  addMessage(`Switched to ${event.target.options[event.target.selectedIndex].text} role. Started a new chat.`, "bot");
});

themeSelect.addEventListener("change", (event) => {
  setTheme(event.target.value);
});

loadTheme();
addMessage("Welcome. Select a role and start chatting.", "bot");
