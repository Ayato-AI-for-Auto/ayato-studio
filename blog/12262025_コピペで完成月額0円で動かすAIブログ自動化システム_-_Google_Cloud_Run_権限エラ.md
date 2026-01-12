---
title: "【コピペで完成】月額0円で動かすAIブログ自動化システム - Google Cloud Run 権限エラー完全攻略ガイド"
date: "12/26/2025 13:16:29"
---

## はじめに：ある日、私はAIに“仕事を奪われる側”の人間になることを恐れた

こんにちは、あやとです。  
あなたも、心のどこかで感じていませんか？「このままAIツールを使うだけの側でいれば、いつか自分の仕事はAIに奪われるのではないか」という、漠然とした不安を。

私もそうでした。だから、決めたのです。単なるAIの「消費者」でいることをやめよう。APIを直接叩き、自分だけの自動化システムを構築する、「生産者」になろう、と。

この記事は、そんな私の挑戦の物語である[『開発日誌』](https://ai-economy-analysis.hatenablog.com/archive/category/%E6%97%A5%E8%AA%8C)から生まれた、**最終的な“答え”**です。物語で語られた数々の失敗、泥沼のデバッグ、そしてAIアシスタントですら見抜けなかった権限の罠…。その全ての苦しみの末にたどり着いた、**最も安全で、最も確実で、最もシンプルな「勝利の方程式」**だけを、ここに凝縮しました。

想像してみてください。

あなたが寝ている間も、旅行している間も、24時間365日、あなたのためだけに働き続ける「自分だけのAIアシスタント」がいる未来を。  
面倒な情報収集や分析から解放され、あなたはもっと創造的で、本当に価値のある仕事に集中できるのです。

この記事は、その未来を実現するための、**設計図であり、最初のチケット**です。

### この記事が、あなたに提供する“2つの資産”

なぜ、この記事を読むとワクワクするのか？その理由を言語化します。

#### 1. あなたの「未来の時間」を守る盾

私が権限エラーと格闘した数日間。この記事は、あなたがその無駄な時間を経験するのを防ぎます。私が失った時間を、あなたの未来の時間としてプレゼントします。このレシピは、あなたの最も貴重な資産である「時間」を守るための盾なのです。

#### 2. 「自分は作れる」という自信という武器

この記事を最後までやり遂げたとき、あなたは「自分はGoogle Cloudを使いこなし、AI自動化システムを構築できる人間なんだ」という、揺るぎない自信を手に入れます。それは、AI時代を生き抜くための、そして次の新しい挑戦に踏み出すための最高の武器になるはずです。

巷のAIチュートリアルは、成功のルートしか語りません。しかし、あなたが本当に知りたいのは、失敗を回避する方法のはずです。この記事は、私が経験した**全ての失敗パターンを予測し、それを回避するための最短ルート**を示します。

さあ、始めましょう。

### 完成するシステムの全体像

このレシピで構築するシステムは、以下の流れで動作します。

1. **Cloud Scheduler（目覚まし時計）**が、毎朝8時に「仕事の時間だ！」と命令を出します。
2. その命令を受け取った**Cloud Run（エンジン）**が、あなたのPythonプログラムを起動します。
3. プログラムは、**Secret Manager（金庫）**から安全にAPIキーを取り出します。
4. **RSSフィード**から最新ニュースを収集し、**Gemini API（頭脳）**に記事の執筆を依頼します。
5. 完成した記事を、**はてなブログ**に自動で投稿します。

この一連の流れを、これから一緒に構築していきましょう。

### この記事の目次

▼ ローカル開発編

* [**第1章：ローカル開発環境の“完成品”レシピ**](#chapter1)
  + 1-1. 全ソースコード一覧（コピペOK）
  + 1-2. コードの“心臓部”解説：なぜFlaskとGunicornが必要なのか？

▼ クラウド構築編（ここからが本番です）

* [**第2章：クラウドの基盤作り - 失敗しないための最初の3ステップ**](#chapter2)
* [**第3章：“金庫”の準備 - Secret ManagerでAPIキーを安全に管理する**](#chapter3)
* [**第4章：権限設定の“最終解答” - 2体の専用ロボットを用意する**](#chapter4)
* [**第5章：デプロイと自動化 - 点と点を線で繋ぐ**](#chapter5)

▼ 困った時のための付録

* [**付録：転ばぬ先の杖 - エラーログ逆引き辞典**](#appendix)

*（第2章以降が、この記事の有料部分です）*

---

▼▼▼ ここから先が、あなたの未来を変える具体的な設計図です ▼▼▼

## 第1章：ローカル開発環境の“完成品”レシピ

ここでは、まずあなたのPC上でシステムを完璧に動作させるための、完成版のコードを全て提供します。この章のコードをあなたのプロジェクトフォルダに配置するだけで、準備の半分は完了です。

### 1-1. 全ソースコード一覧（コピペOK）

以下の6つのファイルを作成し、それぞれの内容をコピー＆ペーストしてください。

#### 1. メインプログラム： `main.py`

Cloud Schedulerからのリクエストを受け取り、ニュース収集からブログ投稿までの一連の処理を実行する、このシステムの心臓部です。

```
import os
import feedparser
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime, timedelta, timezone
import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional
from flask import Flask, request

# --- Flaskアプリケーションのインスタンスを作成 ---
app = Flask(__name__)

# --- 認証ライブラリの代替コード ---
import base64
import hashlib
import uuid
from requests.auth import AuthBase

class CustomWSSEAuth(AuthBase):
    """
    はてなブログAPI用のWSSE認証を生成するクラス。
    外部ライブラリに依存しない自己完結型。
    """
    def __init__(self, username, api_key):
        self.username = username
        self.api_key = api_key
        logging.debug("CustomWSSEAuth initialized.")

    def __call__(self, r):
        # はてなブログAPIが解釈できる日付フォーマットでタイムスタンプを生成
        created = datetime.now(timezone.utc).isoformat(timespec='seconds')
        logging.debug(f"WSSE Created: {created}")

        nonce_raw = uuid.uuid4().bytes
        nonce = base64.b64encode(nonce_raw).decode('utf-8')
        logging.debug(f"WSSE Nonce: {nonce}")

        sha1_digest = hashlib.sha1(
            nonce.encode('utf-8') +
            created.encode('utf-8') +
            self.api_key.encode('utf-8')
        ).digest()
        password_digest = base64.b64encode(sha1_digest).decode('utf-8')
        logging.debug(f"WSSE PasswordDigest: {password_digest}")

        wsse_header = (
            f'UsernameToken Username="{self.username}", '
            f'PasswordDigest="{password_digest}", '
            f'Nonce="{nonce}", '
            f'Created="{created}"'
        )
        r.headers['X-WSSE'] = wsse_header
        logging.debug("X-WSSE header added to request.")
        return r

# --- 初期化処理とグローバル変数 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', handlers=[logging.StreamHandler()])
load_dotenv()

# 設定値はすべて環境変数から取得
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
HATENA_ID = os.environ.get("HATENA_ID")
HATENA_BLOG_ID = os.environ.get("HATENA_BLOG_ID")
HATENA_API_KEY = os.environ.get("HATENA_API_KEY")

# プロジェクトのルートディレクトリを基準にファイルパスを定義
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RSS_FEEDS = [
    'https://www.technologyreview.com/feed/',
    'https://openai.com/blog/rss/',
    'https://blog.google/technology/ai/rss/',
    'https://pub.towardsai.net/feed',
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'http://feeds.feedburner.com/AINewscom',
]
USER_PROFILE_FILE = os.path.join(BASE_DIR, "user_profile.txt")
PERSONA_FILE = os.path.join(BASE_DIR, "persona.txt")

# --- ヘルパー関数定義 ---
def get_recent_news(feed_url: str) -> List[Dict[str, str]]:
    """指定されたRSSフィードから過去24時間以内のニュースを取得する"""
    news_list = []
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    try:
        logging.debug(f"Fetching RSS feed: {feed_url}")
        parsed = feedparser.parse(feed_url)
        for entry in parsed.entries:
            published_dt = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published_dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                published_dt = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
            if published_dt and published_dt >= twenty_four_hours_ago:
                news_list.append({
                    'title': entry.title,
                    'summary': entry.get('summary', '')[:400],
                    'link': entry.link
                })
        logging.debug(f"Found {len(news_list)} recent articles from {feed_url}")
    except Exception as e:
        logging.error(f"RSSフィードの取得または解析に失敗しました ({feed_url}): {e}")
    return news_list

def analyze_and_generate_html_by_ai(ai_model, news_list: List[Dict[str, str]], persona: str) -> Optional[str]:
    """AIを使って複数のニュースを分析・要約し、HTML形式のブログ記事を生成する"""
    if not news_list:
        return None
    prompt = f"""
{persona}
また、あなたはプロのブロガーです。以下のニュース記事を分析し、ブログ記事としてまとめてください。
以下のニュース記事群は、過去24時間で収集されたAI関連の新しい情報です。
これらの情報を総合的に分析し、一つのブログ記事としてHTML形式で出力してください。
# 指示
1. 記事全体のタイトルは不要です。本文のHTMLから書き始めてください。
2. 冒頭に、今日のAIニュース全体の動向をまとめた序文を<p>タグで2〜3文記述してください。
3. ニュースの中から特に重要、あるいは興味深いと思われるものを3〜5個厳選してください。
4. 選んだ各ニュースについて、以下のHTML形式で記述してください。
   - ニュースのタイトルを<h3>タグで囲み、元の記事へのリンク(<a>タグ)を設定してください。
   - <blockquote>タグの中に、ニュースの要点を2〜3文で引用または要約してください。
   - なぜこのニュースが重要なのか、AI専門家の視点から背景や今後の影響などを具体的に解説してください。解説は<p>タグで記述します。
5. 全体をブログ記事として自然な文章になるように構成してください。
6. 出力はHTMLの<body>タグ内に記述する内容のみとし、余計な説明や ```html ... ``` のようなマークダウンは一切含めないでください。
---
# ニュース記事リスト
"""
    for i, news in enumerate(news_list[:10], 1): # 無料枠上限を避けるため10件に制限
        prompt += f"## ニュース {i}\\n"
        prompt += f"タイトル: {news['title']}\\nリンク: {news['link']}\\n概要: {news['summary']}\\n\\n"
    try:
        logging.info("  - [Step 4/5] Gemini AIによる記事生成を開始...")
        response = ai_model.generate_content(prompt)
        logging.info("  - ✅ 記事生成が完了しました。")
        return response.text.strip()
    except Exception as e:
        logging.error(f"  - ❌ AIによる解析・HTML生成エラー: {e}")
        return None

def post_to_hatena_blog(title: str, content_html: str, category: str, is_draft: bool):
    """ はてなブログAtomPub APIを使用して記事を投稿する関数 """
    if not all([HATENA_ID, HATENA_BLOG_ID, HATENA_API_KEY]):
        logging.error("  - ❌ はてなブログの認証情報が不足しています。投稿をスキップします。")
        return

    hatena_blog_url = f"https://blog.hatena.ne.jp/{HATENA_ID}/{HATENA_BLOG_ID}/atom/entry"
    hatena_auth = CustomWSSEAuth(HATENA_ID, HATENA_API_KEY)
    post_status = "下書き" if is_draft else "公開"
    logging.info(f"  - [Step 5/5] はてなブログへ「{post_status}」で投稿を開始...")
    logging.info(f"    - Title: {title}")
    
    entry = ET.Element("entry", xmlns="http://www.w3.org/2005/Atom", **{"xmlns:app": "http://www.w3.org/2007/app"})
    ET.SubElement(entry, "title").text = title
    author = ET.SubElement(entry, "author")
    ET.SubElement(author, "name").text = HATENA_ID
    content = ET.SubElement(entry, "content", type="text/html")
    content.text = content_html
    ET.SubElement(entry, "category", term=category)
    control = ET.SubElement(entry, "app:control")
    draft = ET.SubElement(control, "app:draft")
    draft.text = "yes" if is_draft else "no"
    
    xml_data = ET.tostring(entry, encoding="utf-8")
    headers = {'Content-Type': 'application/atom+xml; charset=utf-8'}

    try:
        response = requests.post(hatena_blog_url, data=xml_data, auth=hatena_auth, headers=headers, timeout=60)
        response.raise_for_status()
        if response.status_code == 201:
            logging.info(f"  - ✅ はてなブログへの投稿に成功しました！ URL: {response.headers.get('Location')}")
        else:
            logging.error(f"  - ❌ はてなブログへの投稿に失敗しました。Status: {response.status_code}, Response: {response.text}")
    except requests.exceptions.RequestException as e:
        logging.error(f"  - ❌ はてなブログAPIへのリクエスト中にエラーが発生しました: {e}")

# --- メイン処理関数 ---
def run_job():
    """AIニュース収集からブログ投稿までの一連の処理を実行する関数"""
    logging.info("======== AIニュース自動投稿ジョブを開始します ========")
    
    if not GOOGLE_API_KEY or not HATENA_ID or not HATENA_BLOG_ID or not HATENA_API_KEY:
        error_message = "必要な環境変数（APIキーなど）が設定されていません。処理を中断します。"
        logging.critical(error_message)
        return error_message, 500
    
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        analysis_model = genai.GenerativeModel('gemini-1.5-flash-latest')
        logging.info("Gemini 1.5 Flash AIモデルの初期化に成功しました。")
    except Exception as e:
        logging.critical(f"❌ AIモデルの初期化に失敗: {e}")
        return f"AI model initialization failed: {e}", 500

    persona = ""
    if os.path.exists(PERSONA_FILE):
        with open(PERSONA_FILE, 'r', encoding='utf-8') as f:
            persona = f.read().strip()
    if not persona:
        logging.error(f"❌ ペルソナファイル '{PERSONA_FILE}' が見つかりません。")
        return "Persona file not found.", 500
    
    logging.info("  - [Step 1/5] 過去24時間以内のニュースをRSSフィードから収集...")
    all_recent_news = []
    for url in RSS_FEEDS:
        all_recent_news.extend(get_recent_news(url))
    
    seen_links = set()
    unique_news = [news for news in all_recent_news if news['link'] not in seen_links and not seen_links.add(news['link'])]
    logging.info(f"  - ✅ {len(unique_news)}件のユニークなニュースを取得しました。")
    
    logging.info("  - [Step 2/5] 関心キーワードに基づいてニュースをフィルタリング...")
    interest_keywords = []
    if os.path.exists(USER_PROFILE_FILE):
        with open(USER_PROFILE_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip() and not line.startswith('#') and ":" in line:
                    key, values = line.split(":", 1)
                    if key.strip() == 'interest_keywords':
                        interest_keywords.extend([k.strip().lower() for k in values.split(',') if k.strip()])
    
    filtered_news = [news for news in unique_news if any(kw in (news['title'] + news['summary']).lower() for kw in interest_keywords)] if interest_keywords else unique_news
    
    if not filtered_news:
        success_message = "フィルタリング後、対象となるニュースはありませんでした。ジョブを正常終了します。"
        logging.info(f"  - ✅ {success_message}")
        return success_message, 200
    logging.info(f"  - ✅ {len(filtered_news)}件のニュースがAI解析の対象です。")

    logging.info("  - [Step 3/5] AIに渡すニュースのリストを最終確認...")
    for i, news in enumerate(filtered_news[:5]):
        logging.info(f"    ({i+1}) {news['title']}")
    if len(filtered_news) > 5:
        logging.info(f"    ...他{len(filtered_news) - 5}件")

    generated_html = analyze_and_generate_html_by_ai(analysis_model, filtered_news, persona)
    if not generated_html:
        return "AI article generation failed.", 500

    today_str = datetime.now().strftime('%Y年%m月%d日')
    blog_title = f"AIの最新動向を網羅!! 今日の重要ニュースまとめ（{today_str}）"
    blog_category = "AIの重要ニュースまとめ"
    
    post_to_hatena_blog(
        title=blog_title,
        content_html=generated_html,
        category=blog_category,
        is_draft=False
    )
    
    final_message = "======== すべての処理が完了しました ========"
    logging.info(final_message)
    return "Job executed successfully.", 200

# --- Flaskのエンドポイント定義 ---
@app.route('/', methods=['POST'])
def handle_request():
    """
    Cloud SchedulerからのHTTP POSTリクエストを受け取り、メイン処理を実行するエンドポイント。
    """
    if 'Google-Cloud-Scheduler' not in request.headers.get('User-Agent', ''):
        logging.warning("Scheduler以外からの不正なリクエストをブロックしました。")
        return "Forbidden: Only requests from Google Cloud Scheduler are allowed.", 403

    logging.info("Cloud Schedulerからのトリガーを受け取りました。メイン処理を開始します。")
    return run_job()

# --- サーバー起動 ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
```

#### 2. コンテナ設計図： `Dockerfile`

Pythonコードをクラウド上で動かすための「実行環境」を定義するファイルです。

```
# ベースとなる公式Pythonイメージを指定
FROM python:3.11-slim

# 環境変数を設定（ロギングがバッファリングされないように）
ENV PYTHONUNBUFFERED True

# コンテナ内の作業ディレクトリを作成
WORKDIR /app

# 最初にrequirements.txtをコピーして、ライブラリをインストール
# (ファイル変更がない限り、このレイヤーはキャッシュされビルドが高速化する)
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# プロジェクトの残りのファイルをコンテナにコピー
COPY . .

# コンテナ起動時に実行されるコマンド
# gunicornを使って、main.py内の'app'という名前のFlaskアプリを起動する
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]
```

#### 3. 依存ライブラリ一覧： `requirements.txt`

このプログラムを動かすために必要なPythonライブラリの一覧です。

```
google-generativeai
python-dotenv
feedparser
requests
Flask
gunicorn
```

#### 4. ローカルテスト用設定ファイル： `.env.sample`

ローカル環境でテストする際に、このファイルの名前を`.env`に変更し、ご自身のAPIキーなどを記述します。**このファイル自体は、決してGitなどで公開しないでください。**

```
# Google AI API Key
GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"

# Hatena Blog AtomPub API Settings
HATENA_ID="YOUR_HATENA_ID"
HATENA_BLOG_ID="YOUR_BLOG_ID.hatenablog.com"
HATENA_API_KEY="YOUR_HATENA_API_KEY"
```

#### 5. AIへの指示書（ペルソナ）： `persona.txt`

AIにどのような役割を演じてほしいかを記述します。

```
あなたはAI技術の動向を日々追いかけている専門家兼テクニカルライターです。
最新のAI関連ニュースを深く理解し、その技術的な重要性やビジネスへの影響について、専門知識がない読者にも分かりやすく魅力的に解説する能力を持っています。
```

#### 6. ニュースフィルタリング用キーワード： `user_profile.txt`

AIに渡す前に、ここで指定したキーワードでニュースを絞り込みます。

```
# 関心のあるキーワード（カンマ区切りで複数指定可能）
interest_keywords: LLM,NVIDIA,SaaS,AI,Gemini,OpenAI,Google
```

### 1-2. コードの“心臓部”解説

なぜ、これだけのファイルが必要なのでしょうか？特に重要な2つのファイルについて、その役割を解説します。

* **なぜFlaskが必要？**: Cloud Runで動くプログラムは、外部からの「仕事の依頼」をHTTPリクエストという形で受け取る必要があります。Flaskは、Pythonコードにそのための「玄関」を簡単に作ってくれる軽量なウェブフレームワークです。Cloud Schedulerがドアをノックしたときに、Flaskがそれに応対してくれます。
* **なぜGunicornが必要？**: Flaskに組み込まれているサーバーは、あくまで開発用の簡易的なものです。Cloud Runという本番環境で、多くのリクエストを安定してさばくためには、より屈強な「執事」のような存在が必要です。Gunicornは、Flaskアプリを本番環境で安定稼働させるための、業界標準のサーバーソフトウェアです。

---

## 第2章：クラウドの基盤作り - 失敗しないための最初の3ステップ

Google Cloudで挫折する人の9割は、この初期設定でつまずきます。しかし、ご安心ください。私が日誌で犯した失敗を、あなたは繰り返す必要はありません。以下の3つのステップを順番に実行するだけで、完璧な基盤が完成します。

### 2-1. プロジェクトの作成と「請求の有効化」

まず、今回のシステムを構築するための「土地」となるプロジェクトを作成します。

1. Google Cloudコンソールにログインし、新しいプロジェクトを作成します。（例：`ai-news-poster-v2`）
2. ナビゲーションメニューから**「お支払い」**を選択し、「このプロジェクトには請求先アカウントがありません」と表示されたら、**「請求先アカウントをリンク」**をクリックして、画面の指示に従い設定を完了させます。

> 【重要】なぜ無料枠なのに請求の有効化が“必須”なのか？
>
> これは、万が一あなたのプログラムが暴走するなどして無料枠を超えた場合に、Googleが料金を請求できることを保証させるための手続きです。この設定をしたからといって、今回のシステムの利用範囲で料金が発生することはまずありませんので、ご安心ください。

（ここに、請求設定画面のスクリーンショットを挿入）

### 2-2. 必要なAPIの有効化（魔法の一行コマンド）

次に、Cloud RunやSecret Managerといった「道具」を使えるように、プロジェクトの利用許可スイッチをONにします。Cloud Shell（コンソール右上の `>\_` アイコン）を開き、以下のコマンドを一行ずつ実行してください。

```
# まず、操作対象のプロジェクトIDをあなたのプロジェクトIDに設定します
gcloud config set project [あなたのプロジェクトID]

# 次に、必要なサービスAPIをまとめて有効化します
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com cloudscheduler.googleapis.com iam.googleapis.com
```

`Operation "..." finished successfully.` と表示されれば成功です。

### 2-3. gcloud CLIのターゲット設定

私が開発日誌のVol.1でハマった「プロジェクトID間違い」を、あなたは絶対に繰り返さないでください。ローカルPCのターミナルで作業する場合、必ずこのコマンドを実行し、正しいプロジェクトを操作対象に設定します。

```
gcloud config set project [あなたのプロジェクトID]
```

これで、クラウド上の基盤作りは完了です。

---

## 第3章：“金庫”の準備 - Secret ManagerでAPIキーを安全に管理する

コードにAPIキーを直接書くのは、家の鍵を玄関に貼り付けておくようなもの。プロの開発者が実践する、最も安全な鍵の管理方法を学びます。

### 3-1. なぜSecret Managerを使うのか？

コンテナに`.env`ファイルを含めてしまうと、コンテナイメージが漏洩した際に、全てのAPIキーが盗まれてしまいます。Secret Managerは、APIキーをGoogleの堅牢な金庫に保管し、許可されたプログラムだけが実行時に鍵を借りられるようにする仕組みです。

（ここに、`.env`をコンテナに含める危険性とSecret Managerの安全性を比較した簡単な図解を挿入）

### 3-2.【解説】4つのシークレット作成手順

コマンドは不要です。Google Cloudコンソールのウェブ画面から、マウス操作だけで安全に作成しましょう。

1. ナビゲーションメニューで「Secret Manager」を検索して開きます。
2. **「+ シークレットを作成」**をクリックします。
3. 以下の情報を入力し、「シークレットを作成」ボタンを押す作業を**4回**繰り返します。
   * **1回目:** 名前: `GOOGLE\_API\_KEY`, 値: `あなたのGoogle AIのAPIキー`
   * **2回目:** 名前: `HATENA\_ID`, 値: `あなたのはてなID`
   * **3回目:** 名前: `HATENA\_BLOG\_ID`, 値: `あなたのはてなブログID`
   * **4回目:** 名前: `HATENA\_API\_KEY`, 値: `あなたのはてなAPIキー`

これで、最も重要な機密情報を安全に保管できました。

---

## 第4章：権限設定の“最終解答” - 2体の専用ロボットを用意する

ここがこの記事の**核心**です。私が開発日誌のVol.2とVol.3で最後まで苦しんだ権限エラーを、あなたは二度と経験する必要はありません。

### 4-1. なぜ「専用ロボット（サービスアカウント）」が必要なのか？

クラウドの世界では、「命令する人」と「実行するプログラム」は別人格です。私たちは、このアプリのためだけに働く2体の専用ロボットを用意し、それぞれに必要最低限の権限だけを与えることで、安全で確実なシステムを構築します。

* **実行用ロボット (`ai-news-poster-sa`)**: 実際にコードを動かす現場作業員。
* **命令用ロボット (`scheduler-invoker`)**: 決まった時間に仕事を依頼しに来るメッセンジャー。

### 4-2.【解説】2体のサービスアカウント作成と、役割（ロール）分担

ナビゲーションメニューで「IAMと管理」 > 「サービスアカウント」を開き、以下の手順で2体のロボットを作成します。

1. **実行用ロボットの作成:**
   * 「+ サービスアカウントを作成」をクリック。
   * サービスアカウント名: `ai-news-poster-sa`
   * 「作成して続行」をクリック。
   * **ロールを選択**: `Secret Manager シークレット アクセサー` を検索して選択。（これが金庫の鍵です）
   * 「完了」をクリック。
2. **命令用ロボットの作成:**
   * 再度「+ サービスアカウントを作成」をクリック。
   * サービスアカウント名: `scheduler-invoker`
   * 「作成して続行」をクリック。
   * **ロールは何も選択せず**に「完了」をクリック。（入門許可証は後で渡します）

これで、最強のチームが編成されました。

---

## 第5章：デプロイと自動化 - 点と点を線で繋ぐ

全ての部品が揃いました。いよいよ、これらを組み立ててシステムに命を吹き込みます。

### 5-1. 究極のデプロイコマンド

ローカルPCのターミナルで、プロジェクトフォルダ（`main.py`がある場所）に移動し、以下の最終決定版コマンドを実行します。

```
gcloud run deploy ai-news-poster \
    --source . \
    --region asia-northeast1 \
    --no-allow-unauthenticated \
    --service-account="ai-news-poster-sa@[あなたのプロジェクトID].iam.gserviceaccount.com" \
    --set-secrets="GOOGLE_API_KEY=GOOGLE_API_KEY:latest,HATENA_ID=HATENA_ID:latest,HATENA_BLOG_ID=HATENA_BLOG_ID:latest,HATENA_API_KEY=HATENA_API_KEY:latest"
```

> コマンド解説
>
> `--service-account`オプションで、先ほど作成した**実行用ロボット**を指定し、`--set-secrets`オプションで、第3章で準備した**金庫**の中身を接続しています。これが、権限エラーを回避する鍵です。

### 5-2.【解説】Cloud Schedulerの設定

次に、毎朝8時に実行を命令するための「目覚まし時計」をセットします。

1. ナビゲーションメニューで「Cloud Scheduler」を検索して開きます。
2. 「ジョブを作成」をクリックします。
3. **地域**: `asia-northeast1 (東京)` を選択。**（重要：ここで間違うとリージョンエラーになります）**
4. **頻度**: `0 8 \* \* \*` （毎朝8時0分）
5. **タイムゾーン**: `日本標準時 (Asia/Tokyo)`
6. 「続行」をクリック。
7. **ターゲットタイプ**: `HTTP`
8. **URL**: 先ほどのデプロイ成功時に表示されたCloud RunのサービスURLを貼り付け。
9. **HTTPメソッド**: `POST`
10. **認証ヘッダー**: `OIDC トークンを追加` を選択。
11. **サービスアカウント**: ドロップダウンから、先ほど作成した**命令用ロボット (`scheduler-invoker@...`)** を選択。
12. 「作成」をクリック。

### 5-3. 最後の接続：入門許可証を渡す

最後に、命令用ロボットがCloud Runの建物のドアを開けられるように、入門許可証を渡します。

1. ナビゲーションメニューで「Cloud Run」を開き、サービス`ai-news-poster`をクリック。
2. **「権限」**タブを開き、「+ アクセス権を付与」をクリック。
3. **新しいプリンシパル**: **命令用ロボット (`scheduler-invoker@...`)** のメールアドレスを貼り付け。
4. **ロール**: `Cloud Run 起動元` を検索して選択。
5. 「保存」をクリック。

> 【コラム】私がハマった「2つの起動元ロール」の罠
>
> 開発日誌Vol.3で語ったように、環境によっては「Cloud Run 起動元」ロールが複数表示されることがあります。もし上記の手順でうまくいかない場合は、表示されているもう一方の起動元ロールも追加してみてください。これこそが、AIアシスタントですら知らなかった、生々しい現場のノウハウです。

---

## 付録：転ばぬ先の杖 - エラーログ逆引き辞典

あなたが私と同じ轍を踏まないように。この開発で遭遇した主なエラーとその解決策をまとめました。エラーが出たら、まずここを確認してください。

* **`PERMISSION\_DENIED (gcloud services enable)` が出たら？** → `gcloud config set project`でプロジェクトIDが正しいか、コンソールで「請求」が有効になっているかを確認。
* **`Revision is not ready` が出たら？** → 実行用ロボット (`ai-news-poster-sa`) に「Secret Manager シークレット アクセサー」ロールが付与されているかを確認。
* **`Schedulerが403で失敗` したら？** → ①SchedulerとCloud Runのリージョンが一致しているか、②命令用ロボット (`scheduler-invoker`) に「Cloud Run 起動元」ロールが付与されているか、の2点を最優先で確認。

---

## 最後に：この“勝利の方程式”を、あなたへ

この記事に書かれていることは、単なる技術的な手順ではありません。それは、私が数日間の試行錯誤の末に掴み取った、思考の軌跡そのものです。

私の失敗の全記録である[『開発日誌』](https://ai-economy-analysis.hatenablog.com/archive/category/%E6%97%A5%E8%AA%8C)が、この挑戦の**物語**であるならば、この記事は、そこから生まれた**再現可能な科学**です。

このレシピが、あなたの「退屈な作業」を“消滅”させ、AIを「作りこなす側」へと踏み出すための、力強い一歩となることを心から願っています。

この挑戦の物語を、一緒に広めてくれませんか？

この記事があなたの心を動かせたなら。下の**2つの感想テンプレート**から、あなたの気持ちに“より近い方”を選んでシェアしていただけると、僕が次の記事を書く最高のエネルギーになります！

#### ▼ この物語にワクワクした方はこちら ▼

> AI学習の「何から…」問題、これで解決かも。  
>   
> @TechLong\_Invest さんのブログがすごい。  
>   
> ✅ AIツール自作のリアルな冒険譚  
> ✅ 物語だから、スッと頭に入ってくる  
> ✅「巨大な敵」に“詰む”→逆転劇は必見  
>   
> AI時代を生き抜くヒントが満載。  
>   
> #自己投資 #AI #あやとのAI冒険ログ

 [この内容でXに投稿する](https://x.gd/Zm3yH)

#### ▼ この学びに価値を感じた方はこちら ▼

> AI学習の教材探し、ついに終点かも。  
>   
> @TechLong\_Invest さんのブログはAIツール自作の全記録で、まさに“生きた教科書”  
>   
> ✅ APIを組み合わせる発想  
> ✅ エラーと戦うリアルな過程  
> ✅ 物語で学べる  
>   
> “使いこなせる人”になりたいなら必読!!  
>   
> #自己投資 #AI #あやとのAI冒険ログ

 [この内容でXに投稿する](https://x.gd/vhLqv)