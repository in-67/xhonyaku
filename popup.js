const ollamaUrl   = document.getElementById("ollamaUrl");
const ollamaModel = document.getElementById("ollamaModel");
const serverType  = document.getElementById("serverType");
const modelRow    = document.getElementById("modelRow");
const status      = document.getElementById("status");

// llama-serverのときはモデル名入力欄を非表示
function updateModelRowVisibility() {
  modelRow.style.opacity  = serverType.value === "llama-server" ? "0.3" : "1";
  modelRow.style.pointerEvents = serverType.value === "llama-server" ? "none" : "auto";
}

serverType.addEventListener("change", updateModelRowVisibility);

// 保存済み設定を読み込み
chrome.storage.sync.get(
  { ollamaUrl: "http://localhost:11434", ollamaModel: "lfm2.5-thinking:latest", serverType: "ollama" },
  (s) => {
    ollamaUrl.value   = s.ollamaUrl;
    ollamaModel.value = s.ollamaModel;
    serverType.value  = s.serverType;
    updateModelRowVisibility();
  }
);

document.getElementById("save").addEventListener("click", () => {
  chrome.storage.sync.set({
    ollamaUrl:   ollamaUrl.value.replace(/\/$/, ""),
    ollamaModel: ollamaModel.value || "lfm2.5-thinking:latest",
    serverType:  serverType.value
  }, () => {
    status.textContent = "保存しました！";
    setTimeout(() => status.textContent = "", 2000);
  });
});
