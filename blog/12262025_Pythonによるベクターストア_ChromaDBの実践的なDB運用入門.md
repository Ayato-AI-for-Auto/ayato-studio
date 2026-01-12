---
title: "Pythonによるベクターストア (ChromaDB)の実践的なDB運用入門"
date: "12/26/2025 13:03:02"
---

# Pythonで始める「実践的」ベクターストア入門 (ChromaDB編)

1024次元のデータをどう扱うか？ 手軽さの裏にある「トレードオフ」を正しく理解する

**執筆者より:** かつて私は、音響分析で得た1024次元のベクトルを既存のRDBに無理やり保存しようとして、痛い目を見ました。カラム数は足りず、JSONで保存すれば検索は遅い...。その失敗から学んだ「適材適所」のデータベース選定について、本音で語ります。

## 導入：なぜ「専用」のデータベースが必要なのか？

RAG（検索拡張生成）アプリを作ろうと思い立った時、最初にぶつかる壁が「データの保存先」です。使い慣れたPostgreSQLやMySQLではダメなのでしょうか？

結論から言えば、「できなくはないが、専用DB（ベクターストア）の方が圧倒的に楽で速い」ケースが多いです。

* **RDBの苦手なこと:** 高次元ベクトル（例: 1536次元）同士の「類似度」を計算して、近い順にソートすること。標準のSQLにはそんな機能はありません。
* **ベクターストアの得意なこと:** まさにその「類似検索」に特化しています。数万、数億のベクトルの中から、質問に最も近いデータを瞬時に見つけ出します。

今回は、その中でもPythonエンジニアに最も人気のある**ChromaDB**を題材に、実践的な使い方とその「限界」について解説します。

## Part 1: 実践ハンズオン - データが「消えない」RAGアプリを作る

多くの入門記事にある `client = chromadb.Client()` は、プログラム終了と同時にデータが消えるインメモリモードです。これでは実用的ではありません。

ここでは、最初からデータをディスクに永続化する「正しい」書き方でハンズオンを行います。

### Step 0: 準備

```
pip install chromadb sentence-transformers
```

### Step 1: データを「永続化」して保存する

以下のコードは、テキストをベクトル化し、カレントディレクトリの `chroma_db` フォルダにデータを保存します。

```
import chromadb
from sentence_transformers import SentenceTransformer
import os

# 1. Embeddingモデルの準備
model = SentenceTransformer('all-MiniLM-L6-v2')

# 2. サンプルデータ
documents = [
    "ChromaDBはローカルで動く便利なベクターストアです。",
    "QdrantはRust製の高性能なベクトル検索エンジンです。",
    "今日のランチは駅前のラーメン屋に行きました。"
]
metadatas = [{"category": "tech"}, {"category": "tech"}, {"category": "daily"}]
ids = ["doc1", "doc2", "doc3"]

# 3. ベクトル化
embeddings = model.encode(documents).tolist()

# 4. ChromaDBに「永続化」モードで接続
# pathを指定することで、データがファイルとして保存されます
client = chromadb.PersistentClient(path="./chroma_db")

# コレクションの取得（存在しなければ作成）
collection = client.get_or_create_collection(name="my_rag_app")

# データがまだなければ追加する
if collection.count() == 0:
    collection.add(embeddings=embeddings, documents=documents, metadatas=metadatas, ids=ids)
    print("データを新規保存しました。")
else:
    print(f"既存のデータ {collection.count()} 件をロードしました。")
```

**確認してみよう:** スクリプトを実行すると、フォルダ内に `chroma_db` が作成されます。もう一度実行すると「既存のデータをロードしました」と表示されるはずです。これが永続化です。

### Step 2: 「意味」で検索する

```
# 検索クエリ：「データベース」という単語を使わず意味で探す
query_vector = model.encode(["AIアプリ開発に使えるツール"]).tolist()

results = collection.query(
    query_embeddings=query_vector,
    n_results=2
)

print("\n--- 意味検索の結果 ---")
for doc, meta, dist in zip(results['documents'][0], results['metadatas'][0], results['distances'][0]):
    print(f"[カテゴリ: {meta['category']}] {doc} (距離: {dist:.4f})")
```

## Part 2: ChromaDBの「罠」 - メタデータ検索の遅さ

ChromaDBは手軽ですが、構造的な弱点があります。それが「メタデータによる絞り込み」です。

### 問題を引き起こすコード

実務では、以下のような検索が頻発します。

```
# 「tech」カテゴリの中で、質問に似ているものを探したい
results = collection.query(
    query_embeddings=query_vector,
    n_results=2,
    where={"category": "tech"}  # ← これが「罠」になる可能性がある
)
```

**なぜこれが「罠」なのか？**

ChromaDB（特に現在のシングルノード版）は、この`where`句の処理が効率的ではありません。データが数万、数十万と増えた時、この絞り込み処理がボトルネックとなり、全体の検索速度が著しく低下するリスクがあります。

もしあなたのアプリが「複雑な絞り込み検索」を多用するなら、この問題は将来必ず表面化します。

## Part 3: 現実的な移行パス - 段階的に成長させる

「じゃあ最初から難しいDBを使うべき？」いいえ、そうとは限りません。アーキテクチャは段階的に進化させることができます。

| フェーズ | 推奨構成 | 特徴と移行のタイミング |
| --- | --- | --- |
| **Phase 1: 学習・PoC** | **ChromaDB (ライブラリモード)** (今回のハンズオン構成) | アプリにDBを内蔵。最も手軽。データが増えてきたり、複数アプリからアクセスしたくなったら次へ。 |
| **Phase 2: 小規模本番** | **ChromaDB (サーバーモード)** | `chroma run` コマンドで独立したサーバーとして起動。アプリとは通信でやり取りする。コードの変更はわずかで済む。 |
| **Phase 3: 本格運用** | **Qdrant / Milvus など** | メタデータ検索の遅さが許容できなくなったら移行。Qdrantも最初はDockerで手軽に試せるため、Phase 2から検討しても良い。 |

重要なのは、「今はPhase 1だからChromaDBで十分」「将来はPhase 3になるから、その時が来たら移行しよう」という見通しを持って選定することです。

## まとめ

1024次元の壁にぶつかったかつての私のように、RDBの限界を感じたらベクターストアの出番です。

まずは**ChromaDBのPersistentClient**で、データが消えない「本物の」RAGアプリを作りましょう。そして、「メタデータ検索の罠」を頭の片隅に置きつつ、アプリの成長に合わせて最適なアーキテクチャを選んでいってください。

## この記事を書いた人

### あやと＠AI for All ([id:ai-economy-analysis](http://blog.hatena.ne.jp/ai-economy-analysis/))

AIで情報分析・処理・生成を自動化し、未来を切り拓く。 ChatGPTが登場する以前から機械学習や深層学習などの情報工学を専攻し、AI活用の試行錯誤を重ねてきました。このブログは、AIによる情報自動化に特化した、私の**「生きるポートフォリオ」**です。

AIの可能性を信じる仲間と繋がりたいです。ご相談やご依頼も、お気軽にご連絡ください。

[![](https://cdn.image.st-hatena.com/image/square/6ac730fede072690413662b27803f99cfe8cf9c0/backend=imagemagick;height=80;version=1;width=80/https%3A%2F%2Fcdn.user.blog.st-hatena.com%2Fcircle_image%2F122608905%2F1514353056384430)

ランキング参加中

人工知能](https://blog.hatena.ne.jp/-/group/10328749687175353006/redirect)

[![](https://cdn.image.st-hatena.com/image/square/adad63b72f1d6545b2ba2538c3fc2923b2fd5989/backend=imagemagick;height=80;version=1;width=80/https%3A%2F%2Fcdn.blog.st-hatena.com%2Fimages%2Fcircle%2Fofficial-circle-icon%2Fcomputers.gif)

ランキング参加中

プログラミング](https://blog.hatena.ne.jp/-/group/11696248318754550880/redirect)

[![](https://cdn.image.st-hatena.com/image/square/923c61f1fa380959d1afc414cfe38b14cc5f9c65/backend=imagemagick;height=80;version=1;width=80/https%3A%2F%2Fcdn.user.blog.st-hatena.com%2Fcircle_image%2F62150696%2F1734941854288688)

ランキング参加中

【公式】2025年開設ブログ](https://blog.hatena.ne.jp/-/group/6802418398313943584/redirect)