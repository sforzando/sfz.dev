# sforzando LLC. and Inc. 公式サイト

## プロジェクト概要

sforzando LLC. and Incl（sfz.dev）の公式コーポレートサイトです。
Hugo静的サイトジェネレーターとCongoテーマを使用して構築されており、会社の実績ポートフォリオ、チームメンバー、お問い合わせ機能を提供しています。

## プロジェクトルール

- ユーザとの応答は必ず **日本語で対応** せよ
  - **質問を先にする** - 指示が不明確な場合は実装前に確認
  - **不確かな情報は必ず確認してから回答** せよ（特に日付、バージョン情報、コマンド名など）
    - **最新ドキュメントを読む** - 外部サービス連携前に公式ドキュメントを確認
    - Claude Codeの知識カットオフに注意（公式ドキュメントで最新情報を確認）
    - ユーザから提示されたURLは必ず参照せよ
    - Playwright, Context 7等のMCPを積極的に活用せよ
- **全コメントは英語** - "何を"ではなく"なぜ"を説明
- **Git操作ルール** - Git操作は基本的にユーザーが行う
  - mainブランチで直接作業することは厳禁
  - **Claude Codeが実行して良いGit操作**
    - Issue着手時のブランチ作成のみ（`git checkout -b {ブランチ名}`）
    - Issue番号がある場合: `{0埋め3桁のIssue番号}_機能名` 形式でブランチを作成
      - 例: Issue #19の場合は `019_prepare_github_actions` のようなブランチ名
- **既存の実装パターンを必ず確認** せよ
- **Linter警告を無視しない**

## 技術スタック

- **Hugo**: 静的サイトジェネレーター
- **テーマ**: git submodule経由
- **Task**: go-task/task（ビルド自動化）
- **TypeScript**: `assets/js/` のソース言語
- **Three.js**: 背景アニメーション
- **TailwindCSS**: Congoテーマに統合（`tailwind.config.js` でカスタマイズ）
- **Playwright**: E2Eテスト
- **Faker.js**: ダミーコンテンツ生成
- **Biome**: JS/TSリンター・フォーマッター
- **typos**: 綴り検査（US英語へ統一）
- **Lefthook**: Gitフックマネージャー
- **デプロイ**: Netlify
- **言語**: 日英バイリンガル

## 主要機能

### 1. Works ポートフォリオシステム

会社実績を紹介するカスタムコンテンツタイプ:

- カスタムメタデータ: `clients`（クライアント）、`collaborators`（協力者）、`references`（参考URL、任意）
- 画像は作品ごとのディレクトリに格納: `assets/img/works/{name}/{thumbnail,key,sub}.jpg`
  - `thumbnail.jpg` は一覧カード用。`.Fill "1200x675 Center"` で16:9にクロップされるため16:9で用意する
  - `key.jpg` は詳細ページ冒頭、`sub.jpg` は本文中（`w-screen` でフルブリード表示）
- 日英バイリンガルコンテンツ
- カスタムアーキタイプ: `archetypes/works.md`

### 2. 背景アニメーション

「創発」と「共創」を表現するThree.jsベースのパーティクルネットワークアニメーション:

- 実装場所: `assets/js/background-waves.ts`
- 空間を漂う複数のパーティクル
- 近接パーティクル同士の動的な接続（共創の視覚化）
- 有機的な動きと色彩変化（創発の表現）
- マウスインタラクション対応

### 5. タグクラウド

PostsページおよびTagページに表示されるラジアルタグクラウド:

- 実装場所: `assets/js/tag-cloud.ts`
- テンプレート: `layouts/partials/tag-cloud.html`
- 黄金角（golden angle）によるDOM+CSS実装（Three.jsは不使用）
- アクティブタグ・ピン留めタグを中心に配置、フロートアニメーション付き

### 6. View Transition API

ページ遷移時のスムーズなアニメーション:

- 実装場所: `layouts/partials/extend-head.html`（CSS View Transitions使用）

### 7. ダミーコンテンツ生成

テスト・開発用ダミーコンテンツをFaker.jsで自動生成:

- 実装場所: `scripts/gen-dummy.ts`
- 対応タイプ: `works`, `posts`
- 使用例: `task generate:dummy -- works 5`

### 3. カスタムShortcode

**コンタクトフォーム**（Netlify Forms統合）:

- `layouts/shortcodes/contactFormJpn.html` - 日本語フォーム
- `layouts/shortcodes/contactFormEng.html` - 英語フォーム
- 機能: Honeypotスパム保護、カスタムスタイリング

**Mapbox統合**:

- `layouts/shortcodes/mapboxGl.html` - インタラクティブな2拠点マップ
- 拠点: 川崎（日本）、バンクーバー（カナダ）
- 回転アニメーション付き3D地球儀表示
- 必要な環境変数: `MAPBOX_ACCESS_TOKEN`

**動画埋め込み**:

- `layouts/shortcodes/videoPlayer.html` - 自前ホスティング動画の再生
- パラメータ: `src`（必須）、`poster`、`caption`、`maxWidth`（縦長動画の幅制限用）
- パスは `assets/` 基準で書く（例: `img/works/flipples/teaser.mp4`）
- `preload="none"` 固定。数MBの動画が初期読み込みに乗るとLCPを支配するため
- 使用例: `{{< videoPlayer src="img/works/flipples/teaser.mp4" poster="img/works/flipples/teaser-poster.png" caption="紹介動画" >}}`

**スマートフォンのモック枠**:

- `layouts/shortcodes/deviceFrame.html` - スクリーンショットを端末枠に収める
- パラメータ: `src`（必須）、`alt`、`caption`、`orientation`（`portrait`（既定）/ `landscape`）、`safeAreaColor`、`notchColor`
- `safeAreaColor` はiOSセーフエリア相当の帯の色。スクリーンショットの背景色に合わせると画面が続いて見える（既定は黒）
- `notchColor` は切り欠きの色。明るい `safeAreaColor` を指定したときに併せて指定する
- `layouts/shortcodes/deviceFrames.html` - 複数の `deviceFrame` を横並びにする器
- スタイルは `assets/css/custom.css` の `.device-frame*`。ベゼルの造形に疑似要素が要るためTailwindでは表現できない
- 枠は自身でアスペクト比を固定するので、別デバイスで撮った画像を入れても枠が歪まない

### 4. 多言語対応

- デフォルト言語: 英語（en）
- 第二言語: 日本語（ja）
- 言語別のメニューとナビゲーション
- 設定ファイル: `config/_default/languages.{ja,en}.toml`, `menus.{ja,en}.toml`

### 8. 記事中の図版

**Mermaid**（Congoに同梱、追加設定不要）:

- `{{< mermaid >}}` を使ったページでのみ mermaid.js が読み込まれる（`themes/congo/layouts/_partials/vendor.html`）
- **`architecture-beta` 構文は使えない**: ラベルが非ASCII文字を受け付けずLexerエラーになる。またエッジにラベルを付ける構文がなく、描画も非決定的（スナップショットが揺れる）。日本語の図は `flowchart` を使う
- 背景が透過だと背景アニメーションと干渉するため、`.mermaid` に半透明パネルを敷いている（`assets/css/custom.css`）

**draw.io**（複雑な図はこちら。原本と書き出しの両方をコミットする）:

```bash
# 編集: assets/img/works/{slug}/architecture.drawio を draw.io で開く
# 書き出し: 引数なしで assets/img/ 配下の全 .drawio を対象にする
task build:diagrams
# 単一ファイルのみ書き出す場合
task build:diagrams -- assets/img/works/flipples/architecture.drawio
```

`task build` の依存には**あえて含めていない**。書き出し済みのSVGをコミットしているため、CIはdraw.io CLIなしでビルドできる。

- 図中のスタイルは **`html=0`** にすること。`html=1` だとラベルが `<foreignObject>` で出力され、SVGが2倍近く肥大する
- **ラベルは折り返さない前提で1行に収める**。`<img>` で表示するとSVGの `<text>` フォールバックが使われ、折り返しが効かずノードからはみ出す
- **図は英語ラベルで1枚だけ作り、日英どちらの記事からも同じSVGを参照する**。2枚を並行して保守すると、片方だけ更新される事故が起きるため。記事ごとに変えるのは `alt` テキストのみ

## 重要な設定

### アナリティクス

- **Google Analytics**: G-L2MP8FTCW6（`config/_default/hugo.toml`）
- **Fathom Analytics**: NDBFFLKC（`config/_default/params.toml`）
- **Microsoft Clarity**: 9a6aus6eoq（`config/_default/params.toml` の `[clarityAnalytics]`）
  - ヒートマップ・セッションリプレイ担当。`@microsoft/clarity` を `assets/js/clarity.ts` から読み、`layouts/partials/extend-head.html` でバンドル
  - 本番ビルドかつ `projectId` が空でない場合のみスクリプトが出力される
  - Cookie同意基盤は未整備（Issue #98）

> **注意**: 上記のIDはいずれもクライアントに露出する前提の公開値であり、秘匿情報ではない。

### デプロイ（Netlify）

- **メインドメイン**: sfz.dev
- **リダイレクト**:
  - sforzando.co.jp → sfz.dev
  - sforzando.net → sfz.dev
  - szk-engineering.com → sfz.dev
- **タイムゾーン**: Asia/Tokyo

### 環境変数

- `MAPBOX_ACCESS_TOKEN`: マップ機能に必須

## コンテンツ構造

```plain
content/
├── posts/           # ブログ記事（日英）
├── works/           # ポートフォリオ（日英）
├── teams/           # チームメンバー（8名、日英）
├── recruitment/     # 採用情報（現在は空）
├── about.{ja,en}.md # 会社概要ページ
├── contact.{ja,en}.md # お問い合わせページ
└── thanks.md        # フォーム送信完了ページ
```

## カスタムレイアウト

- `layouts/partials/extend-head.html` - 背景アニメーション・View Transition統合
- `layouts/partials/tag-cloud.html` - ラジアルタグクラウド
- `layouts/partials/posts/` - Postsカスタムパーシャル
- `layouts/partials/teams/` - Teamsカスタムパーシャル
- `layouts/partials/works/` - Worksカスタムパーシャル
- `layouts/_partials/functions/` - Hugo関数ヘルパー
- `layouts/posts/` - Postsレイアウト
- `layouts/tags/` - Tagsレイアウト
- `layouts/teams/` - Teamsレイアウト
- `layouts/works/` - Worksポートフォリオ表示（将来的に大幅リデザイン予定）
- `layouts/shortcodes/` - カスタムshortcode群
- `archetypes/` - コンテンツテンプレート（`default`, `external`, `posts`, `recruitment`, `team`, `works`）
- `scripts/` - ユーティリティスクリプト（`gen-dummy.ts`, `lighthouse-assert.cjs`, `check-versions.sh` 等）

## 開発ワークフロー

```bash
# 初回セットアップ（Homebrew依存ツール・submodule含む）
task setup

# 依存パッケージのインストール（初回 or 更新後）
task install

# 開発サーバー起動
task start

# 開発サーバー停止 / 再起動
task stop
task restart

# 本番用アセットビルド
task build

# draw.io図をSVGへ書き出し（引数なしで全件）
task build:diagrams

# ダミーコンテンツ生成（例: works を5件）
task generate:dummy -- works 5

# テスト実行（ローカル・ヘッドレス・CI・本番）
task test
task test:headless
task test:ci
task test:prod

# スナップショットを更新せず厳密比較（回帰検出用）
task test:verify

# Lighthouseパフォーマンス計測
task lighthouse

# TypeScriptの型検査
task typecheck

# コード整形
task format

# 綴り検査（US英語へ自動修正）
task lint:typos

# CIと同じLinter一式を検査のみで実行（書き換えない）
task lint:ci

# 依存パッケージの更新確認 / 更新
task outdated
task update:dependencies

# Congoテーマ更新
task update:theme

# テスト結果を削除
task clean

# Netlifyへデプロイ
task deploy

# git-secretで秘密情報を暗号化 / 復号化
task gs:hide
task gs:reveal

# CHANGELOGを更新
task update:changelog
```

> **注意**: Lefthookのpre-commitフックにより、コミット時に `task lint:typos`・`task format`・`task lint:markdown`・`task test:headless`（Playwright）が自動実行される。Playwrightテストが走るためコミットに数分かかる場合がある。

### 綴り検査（typos）

英文のUK綴り混入を防ぐため [typos](https://github.com/crate-ci/typos) を導入している。設定は `_typos.toml`。

- **`locale = "en-us"` が本質**。typosのデフォルト（`locale = "en"`）は英語の方言差を全て正しい綴りとして扱うため、`colour` や `behaviour` を一切検出しない <!-- spellchecker:disable-line -->
- **`ignore-hidden` は既定の `true` のまま**にすること。`false` にすると typos が `.git/objects/` のzlib圧縮オブジェクトをテキストと誤認して走査し、`--write-changes` がリポジトリを破壊しうる
- 除外対象は `themes/`（Congoはsubmodule）、`content/**/dummy_*`（Faker.jsのラテン語Lorem Ipsumが誤検出される）、`CHANGELOG.md`（コミット件名から生成されるためその場で直せない）
- 誤りをあえて引用する必要がある行（本節のような説明文）は、行末に `<!-- spellchecker:disable-line -->` を付けると除外される
- **npmパッケージは存在しない**（2023年にunpublish済み）。ローカルはHomebrew（formula名 `typos-cli` / コマンド名 `typos`）、CIは公式Action `crate-ci/typos`
- CI側のバージョンは `@v1` ではなく**パッチまで固定**する。新リリースが新しいtypoを検出してブランチが無関係に赤くなるのを防ぐため

### CI

`.github/workflows/lint.yml` が `crate-ci/typos` アクションと `task lint:ci`（Biome / Prettier / markdownlint / `tsc --noEmit`）を実行する。submoduleは取得しない（全Linterが `themes/` を除外しているため）。

## セキュリティ

- 機密情報管理に `git-secret` を使用
- `.gitsecret/` ディレクトリに暗号化ファイルを格納
- 秘密情報の復号化: `task gs:reveal`

## 今後のメンテナンスに関する注意事項

1. **Worksポートフォリオ**: 現在はCongo標準レイアウトを使用。将来的に大幅なリデザインを予定。
2. **テーマ更新**: `task update:theme`（`git submodule update --remote --merge themes/congo`）でCongoテーマを更新可能。
3. **カスタムShortcode**: サイト機能に必須。contactFormとmapboxGl shortcodeは削除しないこと。
4. **背景アニメーション**: カスタム実装。変更時はパフォーマンステストを推奨。
5. **バイリンガルコンテンツ**: 全コンテンツで必ず日英両バージョンを維持すること。

## リファレンス

- **ウェブサイト**: <https://sfz.dev/>
- **Congoテーマ**: <https://github.com/jpanther/congo>
- **Congoドキュメント**: <https://jpanther.github.io/congo/docs/>
