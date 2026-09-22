# TETO HOUSE GitHub Pages版

このフォルダを GitHub リポジトリのルートとして運用します。公開サイトは GitHub Pages、室内写真の追加・削除・並べ替えはローカル管理ツールで行います。Firebaseや外部データベースは使用しません。

## 主なファイル

- `index.html`：トップページ
- `styles.css`：デザイン
- `script.js`：写真ギャラリーの読み込み・拡大・前後移動
- `gallery.json`：室内写真の表示順
- `assets/gallery/`：室内写真の本画像
- `assets/thumbs/`：室内写真のサムネイル
- `tools/start-gallery-manager.bat`：写真管理ツール起動用
- `tools/gallery-manager.py`：ローカル管理サーバー
- `tools/gallery-manager.html`：写真管理画面

## GitHub Pages設定

GitHubのリポジトリで **Settings → Pages** を開き、公開元を **Deploy from a branch**、ブランチを `main`、フォルダを `/ (root)` に設定します。

## 室内写真の管理方法

1. GitHub Desktop で `tetohouse-website` のローカルフォルダを開きます。
2. `tools\start-gallery-manager.bat` をダブルクリックします。
3. 初回だけ Pillow が自動インストールされる場合があります。Python 3 が未導入の場合は先にインストールしてください。
4. ブラウザに **TETO HOUSE 写真管理** が開きます。
5. 写真をドラッグ＆ドロップすると、WebPへ変換し、長辺最大1600pxの本画像と640pxのサムネイルを自動生成します。
6. 写真カードをドラッグして表示順を変更します。
7. 不要な写真は `×` で削除します。
8. 並べ替え後は **順番を保存** を押します。
9. GitHub Desktop に戻り、変更を確認して **Commit to main → Push origin** します。
10. GitHub Pagesへ反映されると公開サイトも更新されます。

## 注意

- 管理ツールは `127.0.0.1` のみにバインドされ、PC外部からはアクセスできません。
- 管理画面の「削除」は室内写真ギャラリーの一覧から外す操作です。画像ファイル本体は、設備・比較セクションで利用している可能性があるため安全のため残します。
- `gallery.json` が一時的に読み込めない場合でも、公開サイトは既定の写真一覧へフォールバックします。
- `assets/gallery/` 内の一部写真は設備説明やシミュレーション比較でも利用されています。そのため管理画面から外してもファイル本体は自動削除しません。
