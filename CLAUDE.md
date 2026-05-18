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

- **Hugo**: v0.161.1+extended（静的サイトジェネレーター）
- **テーマ**: Congo v2.13.0（git submodule経由）
- **Go**: 1.26.3
- **Task**: go-task/task（ビルド自動化）
- **TypeScript**: v6.0.3（`assets/js/` のソース言語）
- **Three.js**: v0.184.0（背景アニメーションのみ使用）
- **TailwindCSS**: Congoテーマに統合（`tailwind.config.js` でカスタマイズ）
- **Playwright**: v1.60.0（E2Eテスト）
- **Faker.js**: v9.9.0（ダミーコンテンツ生成）
- **Biome**: JS/TSリンター・フォーマッター
- **Lefthook**: Gitフックマネージャー
- **デプロイ**: Netlify
- **言語**: 日英バイリンガル

## 主要機能

### 1. Works ポートフォリオシステム

会社実績を紹介するカスタムコンテンツタイプ:

- カスタムメタデータ: `clients`（クライアント）、`collaborators`（協力者）、`references`（参考URL、任意）
- 構造化された画像命名規則: `{name}_thumbnail.jpg`, `{name}_key.jpg`, `{name}_sub.jpg`
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

### 4. 多言語対応

- デフォルト言語: 英語（en）
- 第二言語: 日本語（ja）
- 言語別のメニューとナビゲーション
- 設定ファイル: `config/_default/languages.{ja,en}.toml`, `menus.{ja,en}.toml`

## 重要な設定

### アナリティクス

- **Google Analytics**: G-L2MP8FTCW6
- **Fathom Analytics**: NDBFFLKC

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

# ダミーコンテンツ生成（例: works を5件）
task generate:dummy -- works 5

# テスト実行（ローカル・ヘッドレス・CI・本番）
task test
task test:headless
task test:ci
task test:prod

# Lighthouseパフォーマンス計測
task lighthouse

# コード整形
task format

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

> **注意**: Lefthookのpre-commitフックにより、コミット時に `task format`・`task lint:markdown`・`task test:headless`（Playwright）が自動実行される。Playwrightテストが走るためコミットに数分かかる場合がある。

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
