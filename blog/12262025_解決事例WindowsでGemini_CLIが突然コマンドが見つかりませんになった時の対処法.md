---
title: "【解決事例】WindowsでGemini CLIが突然「コマンドが見つかりません」になった時の対処法"
date: "12/26/2025 13:01:48"
---

# 【解決事例】WindowsでGemini CLIが突然「コマンドが見つかりません」になった時の対処法

最終更新日: 2024年11月11日 | カテゴリ: トラブルシューティング

これまで問題なく使えていたGoogleの「Gemini CLI」が、ある日突然動かなくなってしまいました。特に環境を変えた記憶もないのに、コマンドプロンプトが `gemini` という命令を一切受け付けない状態です。

結論から言うと、**「自動更新の失敗によるPATH切れ」**が原因であり、`npm` コマンドによる再インストールであっさり解決しました。同様の症状に陥った方のために、発生したエラーと解決までのログを残しておきます。

## トラブルの状況：突然の「コマンドが見つかりません」

昨日まで普通に使えていたGemini CLIですが、今日ターミナル（コマンドプロンプト/PowerShell）を開いて実行しようとすると、以下のエラーが表示されるようになりました。

### 発生したエラーメッセージ

```
> gemini
gemini : 用語 'gemini' は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません。
名前が正しく記述されていることを確認し、パスが含まれている場合はそのパスが正しいことを確認してから、再試行してください。
発生場所 行:1 文字:1
+ gemini
+ ~~~~~~
    + CategoryInfo          : ObjectNotFound: (gemini:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
```

### 考えられる原因

Gemini CLIは、更新がある場合にデフォルトで自動更新が走る仕様になっています。どうやら、その更新処理がバックグラウンドで走っている最中に、私が誤ってCLIのウィンドウを閉じてしまった可能性が高いです。

更新プロセスが強制終了されたことで、インストール状態が中途半端になり、バグが残ってしまった（あるいは実行ファイルへのPATHが切れてしまった）のではないかと推測しました。

## 試したこと（効果がなかったこと）

トラブルシューティングとして、まずは基本的な確認を行いましたが、これらは効果がありませんでした。

* **PCの再起動：** バックグラウンドで何らかのプロセスがゾンビ化している可能性を考え再起動しましたが、状況は改善しませんでした。これにより「待っていれば直る」系の不具合ではないことが確定しました。
* **設定ファイルの削除：** 設定ファイルが破損している可能性を疑い `~/.config/gemini` の削除を試みましたが、PowerShellではLinuxコマンドの `rm -rf` がそのまま通らず（エイリアス設定などをしていなかったため）、そもそもこれが原因の核心でもなさそうだったため中断しました。

## 解決策：npmによるグローバル再インストール

「コマンドが見つからない＝PATHが通っていない、あるいは実行ファイルが消えた」という基本に立ち返り、Node.jsのパッケージ管理ツールである `npm` を使って、Gemini CLIを上書きインストールすることにしました。

以下のコマンドをコマンドプロンプト（またはPowerShell）で実行します。

```
> npm install -g @google/gemini-cli
```

`-g`（グローバルオプション）を付けるのが最大のポイントです。これにより、PC上のどこからでもコマンドを呼び出せるようにPATHが再設定されます。

### 実行結果

```
added 364 packages, and changed 192 packages in 4m

135 packages are looking for funding
  run `npm fund` for details
```

このコマンド実行後、再び gemini コマンドを叩いたところ、無事に起動するようになりました！

## 考察：なぜこれで直ったのか

今回のトラブルは、おそらく自動更新の中断によって、Windowsが「geminiコマンドの本体がどこにあるか」を見失ってしまった状態（PATHの設定が壊れた状態）にあったと考えられます。

`npm install -g` コマンドは、単にファイルをダウンロードするだけでなく、**「OSに対してコマンドの場所を登録する（PATHを通す）」**という処理も同時に行ってくれます。

PC再起動でも直らなかったことから、自然回復する類のものではなく、明示的に「道しるべ」を作り直す必要があったわけです。同じエラーに出くわした方は、まずは再インストールを試してみてください。

## この記事を書いた人

### あやと＠AI for All ([id:ai-economy-analysis](http://blog.hatena.ne.jp/ai-economy-analysis/))

AIで情報分析・処理・生成を自動化し、未来を切り拓く。 ChatGPTが登場する以前から機械学習や深層学習などの情報工学を専攻し、AI活用とモデル構築の試行錯誤を重ねてきました。このブログは、AIによる情報自動化に特化した、私の**「生きるポートフォリオ」**です。

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