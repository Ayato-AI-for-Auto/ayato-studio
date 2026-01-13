# Ayato Studio デプロイガイド

このフォルダには、`ayato-studio.ai` のソースコード一式が含まれている。

## デプロイ方法（推奨オプション）

### オプション A: Vercel (一番おすすめ)
1. Vercel CLI をインストール: `npm i -g vercel`
2. ログイン: `vercel login`
3. このディレクトリ (`product/ayato_studio_lp`) で `vercel` コマンドを実行。
4. プロンプトに従う（設定はデフォルトのままでOK）。
5. Vercel のダッシュボードから、独自ドメイン `ayato-studio.ai` をプロジェクトに紐付ける。

### オプション B: GitHub Pages
1. GitHub に新しいリポジトリ（例: `ayato-studio-lp`）を作成する。
2. このフォルダ (`product/ayato_studio_lp`) の内容を `main` ブランチにプッシュする。
3. リポジトリの `Settings > Pages` へ行く。
4. ソースとして `main` ブランチを選択。
5. 「Custom domain」に `ayato-studio.ai` を入力し、DNSの設定を行う。

### オプション C: Netlify
1. [Netlify](https://www.netlify.com/) にログイン。
2. 「Add new site」 > 「Deploy manually」を選択。
3. この `ayato_studio_lp` フォルダをブラウザ上にドラッグ＆ドロップするだけ。
4. 「Domain settings」から `ayato-studio.ai` を設定。

## ディレクトリ構造
- `index.html`: メインのランディングページ。
- `blog/`: 個別のブログ記事。
- `style.css`: 全体のスタイルシート。
- `script.js`: アニメーションや装飾用のJavaScript。
