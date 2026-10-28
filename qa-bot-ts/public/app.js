const conversation = document.querySelector("#conversation");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-button");
const suggestions = document.querySelector("#suggestions");
const navItems = document.querySelectorAll(".nav-item");
const resumeView = document.querySelector("#resume-view");
const documentView = document.querySelector("#document-view");
const breadcrumbCurrent = document.querySelector("#breadcrumb-current");
const serviceStatus = document.querySelector("#service-status");
const statusDot = document.querySelector("#status-dot");
const documentForm = document.querySelector("#document-form");
const documentText = document.querySelector("#document-text");
const documentFile = document.querySelector("#document-file");
const documentQuestion = document.querySelector("#document-question");
const promptType = document.querySelector("#prompt-type");
const documentError = document.querySelector("#document-error");
const documentSubmit = document.querySelector("#document-submit");
const documentAnswer = document.querySelector("#document-answer");
const answerText = document.querySelector("#answer-text");
const answerModel = document.querySelector("#answer-model");

let conversationId = null;
let isSending = false;

async function requestJson(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

function setStatus(online, label) {
  serviceStatus.textContent = label;
  statusDot.classList.toggle("online", online);
  statusDot.classList.toggle("offline", !online);
}

async function checkHealth() {
  try {
    const health = await requestJson("/health");
    const pipelineReady = health.retrievalPipeline === "ready";
    setStatus(pipelineReady, pipelineReady ? "Ready" : "Database unavailable");
    if (health.model?.provider) {
      serviceStatus.title = `Model: ${health.model.provider}/${health.model.model}`;
    }
  } catch {
    setStatus(false, "Offline");
  }
}

function addMessage(role, content) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  const avatar = document.createElement("span");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "assistant" ? "✳" : "You";
  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = content;
  row.append(avatar, body);
  conversation.append(row);
  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return row;
}

function addThinking() {
  const row = document.createElement("div");
  row.className = "message assistant";
  row.setAttribute("aria-label", "Assistant is thinking");
  const avatar = document.createElement("span");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = "✳";
  const body = document.createElement("div");
  body.className = "message-body";
  body.innerHTML = '<span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>';
  row.append(avatar, body);
  conversation.append(row);
  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return row;
}

function addResults(results) {
  if (!Array.isArray(results) || results.length === 0) return;
  const list = document.createElement("div");
  list.className = "result-list";
  for (const result of results) {
    const card = document.createElement("article");
    card.className = "result-card";
    const topline = document.createElement("div");
    topline.className = "result-topline";
    const name = document.createElement("span");
    name.className = "result-name";
    name.textContent = result.fileName || "Candidate";
    topline.append(name);
    if (typeof result.score === "number") {
      const score = document.createElement("span");
      score.className = "match-score";
      score.textContent = `${Math.round(result.score * 100)}% match`;
      topline.append(score);
    }
    card.append(topline);

    const contact = [result.email, result.phoneNumber].filter(Boolean);
    if (contact.length) {
      const details = document.createElement("div");
      details.className = "result-contact";
      details.textContent = contact.join(" · ");
      card.append(details);
    }

    const info = result.extractedInfo;
    if (info?.currentCompany || info?.location || info?.experience) {
      const detail = document.createElement("div");
      detail.className = "result-detail";
      detail.textContent = [info.currentCompany, info.location, info.experience].filter(Boolean).join(" · ");
      card.append(detail);
    }
    if (Array.isArray(info?.skills) && info.skills.length) {
      const skills = document.createElement("div");
      skills.className = "result-skills";
      for (const skill of info.skills.slice(0, 8)) {
        const tag = document.createElement("span");
        tag.className = "result-skill";
        tag.textContent = skill;
        skills.append(tag);
      }
      card.append(skills);
    }
    if (result.llmReasoning) {
      const reasoning = document.createElement("div");
      reasoning.className = "result-detail";
      reasoning.textContent = result.llmReasoning;
      card.append(reasoning);
    }
    list.append(card);
  }
  conversation.append(list);
  list.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function sendChat(message) {
  const cleaned = message.trim();
  if (!cleaned || isSending) return;
  isSending = true;
  suggestions.hidden = true;
  addMessage("user", cleaned);
  chatInput.value = "";
  chatInput.style.height = "auto";
  sendButton.disabled = true;
  const thinking = addThinking();

  try {
    const data = await requestJson("/chat", {
      method: "POST",
      body: JSON.stringify({ message: cleaned, conversationId: conversationId || undefined }),
    });
    conversationId = data.conversationId;
    thinking.remove();
    addMessage("assistant", data.response || "I couldn't find an answer for that question.");
    addResults(data.searchResults);
  } catch (error) {
    thinking.remove();
    addMessage("assistant", `I couldn't complete that request. ${error.message}`);
  } finally {
    isSending = false;
    sendButton.disabled = false;
    chatInput.focus();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChat(chatInput.value);
});

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 130)}px`;
});

suggestions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-prompt]");
  if (button) sendChat(button.dataset.prompt);
});

document.querySelector("#new-chat-button").addEventListener("click", async () => {
  let cleanupError = "";
  if (conversationId) {
    try {
      const response = await fetch(`/chat/${encodeURIComponent(conversationId)}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }
    } catch (error) {
      cleanupError = error instanceof Error ? error.message : String(error);
    }
  }
  conversationId = null;
  conversation.replaceChildren();
  suggestions.hidden = false;
  chatInput.value = "";
  if (cleanupError) {
    addMessage("assistant", `I couldn't clear the previous conversation from the server. ${cleanupError}`);
  }
  chatInput.focus();
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const isDocument = item.dataset.view === "document";
    navItems.forEach((navItem) => navItem.classList.toggle("active", navItem === item));
    resumeView.hidden = isDocument;
    documentView.hidden = !isDocument;
    breadcrumbCurrent.textContent = isDocument ? "Ask a document" : "Resume assistant";
  });
});

documentFile.addEventListener("change", async () => {
  const file = documentFile.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    documentError.textContent = "Choose a text file smaller than 10 MB.";
    documentFile.value = "";
    return;
  }
  try {
    documentText.value = await file.text();
    documentError.textContent = "";
  } catch {
    documentError.textContent = "That file couldn't be read. Please paste its text instead.";
  }
});

documentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = documentText.value.trim();
  const question = documentQuestion.value.trim();
  if (!text || !question) return;
  documentError.textContent = "";
  documentAnswer.hidden = true;
  documentSubmit.disabled = true;
  documentSubmit.textContent = "Thinking…";
  try {
    const data = await requestJson("/search/document", {
      method: "POST",
      body: JSON.stringify({ documentText: text, question, promptType: promptType.value }),
    });
    answerText.textContent = data.output;
    answerModel.textContent = `${data.provider} · ${data.model}`;
    documentAnswer.hidden = false;
    documentAnswer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    documentError.textContent = error.message;
  } finally {
    documentSubmit.disabled = false;
    documentSubmit.innerHTML = 'Ask about this document <span aria-hidden="true">→</span>';
  }
});

checkHealth();
