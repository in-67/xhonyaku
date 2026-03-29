// 日本語文字判定
const jpRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;

// ツイートを処理する関数（強化版）
function processTweet(tweet) {
  const textEl = tweet.querySelector('div[data-testid="tweetText"]');
  if (!textEl || textEl.dataset.translated) return;

  const text = textEl.innerText.trim();
  if (!text || jpRegex.test(text)) return; // 日本語 or 空 → スキップ

  textEl.dataset.translated = "true";

  // backgroundに翻訳依頼
  chrome.runtime.sendMessage({ action: "translate", text: text }, (response) => {
    if (response && response.translated && response.translated !== text) {
      const transDiv = document.createElement("div");
      transDiv.style.cssText = `
        margin-top: 10px;
        padding: 10px 12px;
        background: #f0f2f5;
        border-radius: 8px;
        font-size: 15px;
        line-height: 1.5;
        color: #0f1419;
        border-left: 4px solid #d68101;
      `;
      transDiv.innerHTML = `<strong>日本語訳：</strong>${response.translated}`;
      textEl.after(transDiv);
    }
  });
}

// 親ツイートを探すヘルパー（遅延ロード対応）
function findTweetAncestor(node) {
  while (node && node !== document.body) {
    if (node.matches && (
      node.matches('article[data-testid="tweet"]') ||
      node.matches('div[data-testid="tweet"]') ||
      node.matches('div[data-testid="cellInnerDiv"]')
    )) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

// MutationObserver（強化版）
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;

      // 直接ツイート要素の場合
      let tweets = Array.from(node.querySelectorAll('article[data-testid="tweet"], div[data-testid="tweet"], div[data-testid="cellInnerDiv"]'));
      if (node.matches && (node.matches('article[data-testid="tweet"]') || node.matches('div[data-testid="tweet"]') || node.matches('div[data-testid="cellInnerDiv"]'))) {
        tweets.unshift(node);
      }

      // 内部要素が追加された場合も親ツイートを探す
      const ancestor = findTweetAncestor(node);
      if (ancestor) {
        tweets.push(ancestor);
      }

      // 重複除去して処理
      new Set(tweets).forEach(processTweet);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// 初回読み込み時も処理（少し長めに待機）
setTimeout(() => {
  document.querySelectorAll('article[data-testid="tweet"], div[data-testid="tweet"], div[data-testid="cellInnerDiv"]').forEach(processTweet);
}, 2000);