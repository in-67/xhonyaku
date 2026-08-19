## xの英語記事をローカルapiで翻訳するブラウザ拡張

このデモは、単にAIにコードを書かせたものではなく、
**ローカルLLMを実際の用途に組み込んで動かすところまでを実装したデモ**です。

目的は、**X上の英語投稿を検出し、ローカルLLMで自動翻訳して、その場に日本語訳を表示すること**です。

処理の流れはシンプルです。

**Xの投稿を検出
→ 英語投稿を抽出
→ ローカルLLMへ送信
→ 翻訳結果を取得
→ Xの画面上へ表示**

そのために以下を使用しています。

* Chrome拡張としてXのページを直接操作
* `content.js` で投稿を検出・翻訳結果を表示
* `background.js` からローカルLLM APIへ通信
* Ollama / llama-server でLLMをローカル実行
* `MutationObserver` でスクロール等によって後から追加される投稿にも追従

この用途では、データ保存やユーザー管理は必要ないため、
**独自のバックエンド、データベース、認証基盤、クラウドLLM APIなどは持たせず、必要な構成だけに絞っています。**


<img src="./sa.png">

◇ 前提
* Win11
* Ollama(llm:lfm2.5-thinking:latest)
  * ollama インストール
  * ollama run lfm2.5-thinking:latest
* chrome

---

## 🚀 インストール方法

1.  **ソースコードの準備**
    本リポジトリを `xhonyaku.zip` でダウンロードし、任意の場所へ解凍してください。
2.  **拡張機能ページを表示**
    ブラウザのアドレスバーに `chrome://extensions/` と入力して開きます。
3.  **デベロッパーモードを有効化**
    画面右上の **「デベロッパー モード」** スイッチをオンにします。
4.  **フォルダを読み込む**
    左上の **「展開して読み込む」** ボタンを押し、`manifest.json` が含まれているフォルダを選択します。
5.  **完了**
    拡張機能一覧にアイコンが表示されればインストール完了です。

---

## 💡 Ollama 接続のための設定（重要）

ブラウザのセキュリティ制限（CORS）により、
動作しない場合は、以下の手順で環境変数を設定し、Ollama を再起動してください。

### Windows
環境変数に追加、変数名：OLLAMA_ORIGINS、変数値：chrome-extension://*
<img src="env.png"><br>

### Windows (PowerShell)
```powershell
$env:OLLAMA_ORIGINS="chrome-extension://*"
ollama serve
```

## Mac / Linux 

```bash
OLLAMA_ORIGINS="chrome-extension://*" ollama serve
```
