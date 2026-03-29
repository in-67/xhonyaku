chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    chrome.storage.sync.get(
      { ollamaUrl: "http://localhost:11434", ollamaModel: "lfm2.5-thinking:latest" },
      (settings) => {
        translateOllama(request.text, settings.ollamaUrl, settings.ollamaModel, sendResponse);
      }
    );
    return true;
  }
});

function translateOllama(text, baseUrl, model, sendResponse) {
  const url = `${baseUrl}/api/chat`;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: `以下のテキストを日本語に翻訳してください。翻訳文のみ返してください。\n\n${text}` }],
      stream: false
    })
  })
    .then(res => {
      if (!res.ok) return res.text().then(t => { throw new Error(`HTTP ${res.status}: ${t}`); });
      return res.json();
    })
    .then(data => {
      let content = data.message?.content || "";
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      sendResponse({ translated: content || text });
    })
    .catch(err => {
      console.error("[Ollama] error:", err.message || err);
      sendResponse({ translated: text });
    });
}
