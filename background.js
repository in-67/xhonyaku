chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    chrome.storage.sync.get(
      {
        ollamaUrl: "http://localhost:11434",
        ollamaModel: "lfm2.5-thinking:latest",
        serverType: "ollama"   // "ollama" or "llama-server"
      },
      (settings) => {
        if (settings.serverType === "llama-server") {
          translateLlamaServer(request.text, settings.ollamaUrl, sendResponse);
        } else {
          translateOllama(request.text, settings.ollamaUrl, settings.ollamaModel, sendResponse);
        }
      }
    );
    return true;
  }
});

// Ollama用 (/api/chat)
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

// llama-server用 (/v1/chat/completions - OpenAI互換)
function translateLlamaServer(text, baseUrl, sendResponse) {
  const url = `${baseUrl}/v1/chat/completions`;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: `以下のテキストを日本語に翻訳してください。翻訳文のみ返してください。\n\n${text}` }],
      stream: false
    })
  })
    .then(res => {
      if (!res.ok) return res.text().then(t => { throw new Error(`HTTP ${res.status}: ${t}`); });
      return res.json();
    })
    .then(data => {
      let content = data.choices?.[0]?.message?.content || "";
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      sendResponse({ translated: content || text });
    })
    .catch(err => {
      console.error("[llama-server] error:", err.message || err);
      sendResponse({ translated: text });
    });
}
