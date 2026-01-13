# Ayato Studio 運用・デプロイガイド

このディレクトリは `ayato-studio.ai` のフロントエンド資産だ。現在は **GitHub Pages** でホスティングされており、ローカルのスクリプトで自動運用されている。

## 構成のポイント
- **ホスティング**: GitHub Pages (Netlifyから移行済。コストゼロ、ビルド無制限)
- **ドメイン**: `ayato-studio.ai` (Cloudflare経由)
- **自動化**: `agent_server` 側のスクリプトで記事生成からデプロイまで完結。

## 運用方法

### 1. 設定の変更 (`config.js`)
SNSのURLやメールアドレス、機能のON/OFFなどは `config.js` で一元管理している。HTMLを直接いじる必要はない。

### 2. デプロイ (`auto_deploy.py`)
変更を加えたら、以下のコマンド一発で本番反映される。
```powershell
# agent_server の仮想環境が有効な状態で実行
uv run python product/agent_server/scripts/auto_deploy.py
```
このスクリプトがハッシュ値をチェックし、変更があれば自動的に `ayato-studio` リポジトリへ同期して GitHub へプッシュする。

## ディレクトリ構造
- `index.html`: メインのランディングページ。
- `config.js`: **[重要]** サイト全体の設定ファイル。
- `blog/`: 自動生成された記事が格納される場所。
- `style.css`: 共通スタイル（グラスモーフィズム採用）。
- `script.js`: アニメーション制御および `config.js` の反映ロジック。
- `CNAME`: GitHub Pages用の独自ドメイン設定ファイル。

## 注意事項
- 直接 `ayato-studio` リポジトリ（ターゲット）の方をいじらないこと。必ずこの `product/ayato_studio_lp` を修正し、`auto_deploy.py` を通して更新すること。
- 画像を追加する場合は、このフォルダ内に配置してリンクを貼ること。
