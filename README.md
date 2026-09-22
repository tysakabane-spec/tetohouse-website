# TETO HOUSE GitHub Pages版

このフォルダの内容をGitHubリポジトリのルートへ配置すると、静的サイトとして公開できます。

## 主なファイル

- `index.html`：トップページ
- `styles.css`：デザイン
- `script.js`：写真ギャラリーの拡大・前後移動
- `assets/`：掲載画像とサムネイル
- `CNAME`：独自ドメイン `tetohouse.tokyo` の設定
- `robots.txt` / `sitemap.xml`：検索エンジン向け設定

## GitHub Pages設定

GitHubのリポジトリで **Settings → Pages** を開き、公開元を **Deploy from a branch**、ブランチを `main`、フォルダを `/ (root)` に設定します。

サイトは外部サーバー処理やビルド処理を必要としません。管理者向けの写真アップロード・並べ替え機能は、静的ホスティングでは利用できないため含めていません。
