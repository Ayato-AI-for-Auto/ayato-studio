---
title: "Gemini CLIインストール＆初期設定&VScode連携ガイド for Windows"
date: "12/26/2025 13:10:17"
---

# Gemini CLIインストール＆初期設定ガイド for Windows

コマンドプロンプトから始めるAIとの対話

2025年10月7日

## Gemini CLIとは？

Gemini CLIは、GoogleのAIモデル「Gemini」のパワーを、開発者にとって最も馴染み深いツールの一つであるターミナル（コマンドプロンプト）から直接利用できるようにするものです。この記事では、Windows環境へのインストールから、VSCodeとの連携設定までを詳しく解説します。

## STEP 1: インストールコマンドの確認

まずは公式のGitHubリポジトリにアクセスし、インストール方法を確認します。

リポジトリの中にある「Installation」セクションを探し、お使いのOSに合ったインストール方法を見つけます。

![インストールコマンドの確認](https://cdn-ak.f.st-hatena.com/images/fotolife/a/ai-economy-analysis/20251007/20251007085947.png)

## STEP 2: コマンドプロンプトでのインストール

コマンドプロンプト（またはPowerShell）を起動し、先ほど確認したコマンドを入力して実行します。

$ npx install google-gemini

途中でパッケージのインストールに関する確認（Y/N）が表示された場合は、`y`を入力してEnterキーを押してください。しばらく待つとインストールが完了します。

## STEP 3: 初回起動と認証

インストールが完了したら、`gemini`コマンドで早速起動してみましょう。初回起動時は、以下のような初期設定画面が表示されます。

![Gemini CLIの初回起動画面](https://cdn-ak.f.st-hatena.com/images/fotolife/a/ai-economy-analysis/20251007/20251007090512.png)

この画面は、Geminiを利用するための「認証」を求めるものです。最も簡単な方法は、デフォルトで選択されている「1. Login with Google」です。そのままEnterキーを押しましょう。  
Google ai studoのAPIキーを取得する方法は[こちら](https://ai-economy-analysis.hatenablog.com/entry/2025/08/11/151511?_gl=1*11wksj3*_gcl_au*Mzg3MDA4NzI4LjE3NTgxNTU3Mjc.)に記載しています。

Enterキーを押すと、Webブラウザが自動で起動し、Googleアカウントでのログインを求められます。

![Googleアカウントでの認証画面](https://cdn-ak.f.st-hatena.com/images/fotolife/a/ai-economy-analysis/20251007/20251007091027.png)

アカウントを選択し、許可を求める画面で「許可」をクリックすると認証が完了します。ターミナルに戻ると、Geminiとの対話が開始できる状態になっているはずです。

![認証完了後のGemini CLI](https://cdn-ak.f.st-hatena.com/images/fotolife/a/ai-economy-analysis/20251007/20251007090223.png)

## STEP 4: VSCodeと連携してコーディングを加速させよう

Gemini CLIは単体でも強力ですが、VSCodeと連携させることで、コーディングアシスタントとしての真価を発揮します。

### 4-1. 拡張機能「Gemini CLI Companion」をインストール

まず、VSCodeを開き、拡張機能マーケットプレイスで「Gemini CLI Companion」を検索してインストールします。これは、CLIとVSCodeエディタを繋ぐための公式の拡張機能です。

![VSCode拡張機能のインストール](https://cdn-ak.f.st-hatena.com/images/fotolife/a/ai-economy-analysis/20251007/20251007091358.png)

### 4-2. VSCodeのターミナルで連携を許可

拡張機能のインストール後、VSCodeの内蔵ターミナル（`Ctrl + @`で開けます）で`gemini`コマンドを実行します。すると、初回のみ以下のような連携許可を求めるプロンプトが表示されます。

![VSCodeとの連携許可を求めるプロンプト](https://cdn-ak.f.st-hatena.com/images/fotolife/a/ai-economy-analysis/20251007/20251007091946.png)

ここで「1. Yes」を選択してEnterキーを押してください。これで連携設定は完了です。「Connected to VS Code」というメッセージが表示されれば成功です。

## まとめ

以上で、Gemini CLIのインストールとVSCode連携の初期設定は完了です。これであなたも、VSCodeという強力なエディタと統合されたAIの力を借りることができるようになりました。コーディングがさらに快適になるはずです！

もし、連携がうまくいかない場合は、別途公開しているを参考にしてみてください。

## この記事を書いた人

### あやと＠AI for All ([id:ai-economy-analysis](http://blog.hatena.ne.jp/ai-economy-analysis/))

AIで情報分析・処理・生成を自動化し、未来を切り拓く。 ChatGPTが登場する以前から機械学習や深層学習などの情報工学を専攻し、AI活用とモデル構築の試行錯誤を重ねてきました。このブログは、AIによる情報自動化に特化した、私の**「生きるポートフォリオ」**です。

AIの可能性を信じる仲間と繋がりたいです。ご相談やご依頼も、お気軽にご連絡ください。

© 2025 インストール＆連携ガイド