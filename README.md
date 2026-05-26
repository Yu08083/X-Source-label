# X-Source-label

X(Twitter) で非表示になったツイートの投稿元ラベル（「Twitter for iPhone」など）を、日付の隣にインライン表示するブックマークレットです。

🔗 **公開ページ**: https://yu08083.github.io/X-Source-label/

## これは何ですか

X(Twitter) は 2022 年末頃から、ツイートの投稿元（`source` フィールド）の表示を公式 UI から取りやめました。しかしデータ自体は X のサーバーに残っており、内部用 GraphQL エンドポイントの一部（`TweetResultByRestId`）では今もこのフィールドが返ってきます。

このツールは、そのレスポンスから投稿元を抜き出し、ツイートの日付の右側に挿入するだけの、極小のブックマークレットです。

```
2026年5月26日 · Twitter for iPhone
                ↑ この部分が追加されます
```

## 使い方

1. [公開ページ](https://yu08083.github.io/X-Source-label/) を開く
2. 「**Source Label**」ボタンをブックマークバーへドラッグ
3. X.com にログインした状態で個別のツイートページを開く
4. ブックマークをクリック → 日付の右側に投稿元のラベルが追加されます

## 仕組み

- 認証は、ブラウザに保存されている X.com のセッションクッキー（`ct0`）を使用します
- 通信先は `api.x.com` のみで、外部サーバーは経由しません
- 個別ツイートページ（URL に `/status/数字` が含まれるページ）でのみ動作します
- 取得した `source` フィールドの値を、`<time>` 要素を含む `<a>` の直後に挿入します
- 色は `<time>` 要素の computed color を引き継ぐので、X のテーマ（ライト / ディム / ダーク）にそのまま追随します

実装は [`assets/js/bookmarklet.js`](assets/js/bookmarklet.js)（可読版）と [`assets/js/main.js`](assets/js/main.js)（ページ埋め込み用の圧縮版）にあります。

## ファイル構成

```
X-Source-label/
├── index.html              ランディングページ
├── assets/
│   ├── css/
│   │   └── styles.css      スタイルシート
│   └── js/
│       ├── main.js         ページ用 JS（圧縮済みブックマークレットを含む）
│       └── bookmarklet.js  可読版（コメント付き）
├── README.md
├── LICENSE                 MIT
└── .gitignore
```

## ローカルで動作確認

このリポジトリは静的サイトです。`index.html` をブラウザで開くだけで動きます。

```bash
git clone https://github.com/Yu08083/X-Source-label.git
cd X-Source-label
python3 -m http.server 8000
# → http://localhost:8000
```

## GitHub Pages で公開する

1. このリポジトリの **Settings → Pages** を開く
2. Source: `Deploy from a branch`、Branch: `main` / `/ (root)` を選択
3. 数十秒後に `https://yu08083.github.io/X-Source-label/` で公開されます

## 注意事項

- 非公開アカウントのツイートには使用できません
- 削除済みのツイート、ソース情報が空のツイートでは表示されません
- X 側の仕様変更により、突然動作しなくなる可能性があります
- このブックマークレットは X(Twitter) の公式・非公式どちらでもありません。利用は自己責任でお願いします

## クレジット

- 実装アイデアの参考: [irucabot/ReturnTweetSourceLabel](https://github.com/irucabot/ReturnTweetSourceLabel)
- 内部 API リファレンス: [fa0311/TwitterInternalAPIDocument](https://github.com/fa0311/TwitterInternalAPIDocument)
- 作者: [@yu_](https://x.com/yu_)

## ライセンス

[MIT](LICENSE)
