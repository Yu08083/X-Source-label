# X-Source-label

X(Twitter) で非表示になったツイートの投稿元ラベル（「Twitter for iPhone」など）を、日付の隣にインライン表示するツールです。

🔗 **公開ページ**: https://yu08083.github.io/X-Source-label/

## これは何ですか

X(Twitter) は 2022 年末頃から、ツイートの投稿元（`source` フィールド）の表示を公式 UI から取りやめました。しかしデータ自体は X のサーバーに残っており、内部用 GraphQL エンドポイントの一部（`TweetResultByRestId`）では今もこのフィールドが返ってきます。

このツールは、そのレスポンスから投稿元を抜き出し、ツイートの日付の右側に挿入します。

```
2026年5月26日 · Twitter for iPhone
                ↑ この部分が追加されます
```

## 2 つの使い方

### A. ブックマークレット（PC 向け）

1. [公開ページ](https://yu08083.github.io/X-Source-label/) を開く
2. 「**Source Label**」ボタンをブックマークバーへドラッグ
3. X.com の個別ツイートページを開いて、ブックマークをクリック

### B. ユーザースクリプト（スマホ・自動表示）

1. ユーザースクリプト管理ツールをインストール
   - **iPhone / iPad**: [Userscripts](https://apps.apple.com/jp/app/userscripts/id1463298887)（無料、Safari 拡張機能）
   - **Android**: Kiwi Browser または Firefox + [Tampermonkey](https://www.tampermonkey.net/)
   - **PC**: [Tampermonkey](https://www.tampermonkey.net/) または [Violentmonkey](https://violentmonkey.github.io/)
2. [`source-label.user.js`](https://raw.githubusercontent.com/Yu08083/X-Source-label/main/source-label.user.js) をインストール
3. 以降、X.com を開くだけで自動表示されます

## 仕組み

- 認証は、ブラウザに保存されている X.com のセッションクッキー（`ct0`）を使用します
- 通信先は `api.x.com` のみで、外部サーバーは経由しません
- 個別ツイートページ（URL に `/status/数字` が含まれるページ）でのみ動作します
- 取得した `source` フィールドの値を、`<time>` 要素を含む `<a>` の直後に挿入します
- 色は `<time>` 要素の computed color を引き継ぐので、X のテーマ（ライト / ディム / ダーク）にそのまま追随します
- ユーザースクリプト版は、SPA ナビゲーション（`pushState` / `popstate`）を監視し、別ツイートに移動した際にも自動で再実行します

## ファイル構成

```
X-Source-label/
├── index.html                  ランディングページ
├── source-label.user.js        ユーザースクリプト（インストール用）
├── assets/
│   ├── css/styles.css          スタイルシート
│   ├── js/
│   │   ├── main.js             ページ用 JS（圧縮済みブックマークレットを含む）
│   │   └── bookmarklet.js      可読版ブックマークレット
│   └── icons/                  favicon, apple-touch-icon, etc.
├── site.webmanifest            PWA マニフェスト
├── README.md
├── LICENSE                     MIT
└── .gitignore
```

## ローカルで動作確認

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
- このツールは X(Twitter) の公式・非公式どちらでもありません。利用は自己責任でお願いします

## クレジット

- 実装アイデアの参考: [irucabot/ReturnTweetSourceLabel](https://github.com/irucabot/ReturnTweetSourceLabel)
- 内部 API リファレンス: [fa0311/TwitterInternalAPIDocument](https://github.com/fa0311/TwitterInternalAPIDocument)
- 作者: [@yu_](https://x.com/yu_)

## ライセンス

[MIT](LICENSE)
