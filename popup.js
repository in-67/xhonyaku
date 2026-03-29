const ollamaUrl = document.getElementById("ollamaUrl");
const ollamaModel = document.getElementById("ollamaModel");
const status = document.getElementById("status");

chrome.storage.sync.get({ ollamaUrl: "http://localhost:11434", ollamaModel: "lfm2.5-thinking:latest" }, (s) => {
  ollamaUrl.value = s.ollamaUrl;
  ollamaModel.value = s.ollamaModel;
});

document.getElementById("save").addEventListener("click", () => {
  chrome.storage.sync.set({
    ollamaUrl: ollamaUrl.value.replace(/\/$/, ""), // 末尾スラッシュを自動除去
    ollamaModel: ollamaModel.value || "lfm2.5-thinking:latest"
  }, () => {
    status.textContent = "保存しました！";
    setTimeout(() => status.textContent = "", 2000);
  });
});
