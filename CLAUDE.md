# sforzando LLC. and Inc. 公式サイト

## プロジェクト概要

sforzando LLC. and Incl（sfz.dev）の公式コーポレートサイトです。
Hugo静的サイトジェネレーターとCongoテーマを使用して構築されており、会社の実績ポートフォリオ、チームメンバー、お問い合わせ機能を提供しています。

## プロジェクトルール

- ユーザとの応答は必ず **日本語で対応** せよ
  - **質問を先にする** - 指示が不明確な場合は実装前に確認
  - **不確かな情報は必ず確認してから回答** せよ（特に日付、バージョン情報、コマンド名など）
    - **最新ドキュメントを読む** - 外部サービス連携前に公式ドキュメントを確認
    - 現在は2025年11月、Claude Codeの知識はここから1年ほど古い
    - ユーザから提示されたURLは必ず参照せよ
    - Playwright, Context 7, Serena等のMCPを積極的に活用せよ
- **全コメントは英語** - "何を"ではなく"なぜ"を説明
- **Git操作ルール** - Git操作は基本的にユーザーが行う
  - **Claude Codeが実行して良いGit操作**：
    - Issue着手時のブランチ作成のみ（`git checkout -b {ブランチ名}`）
    - Issue番号がある場合: `{0埋め3桁のIssue番号}_機能名` 形式でブランチを作成
    - 例: Issue #19の場合は `019_prepare_github_actions` のようなブランチ名
  - **Claude Codeが許可なく実行してはいけないGit操作**：
    - `git add`（ステージング）
    - `git commit`（コミット作成）
    - `git push`（リモートへのプッシュ）
    - その他すべてのGit操作
  - mainブランチで直接作業することは厳禁
- **既存の実装パターンを必ず確認** せよ
  - **新機能実装前の必須チェックリスト**（すべて実施してから実装開始）：
    1. **メモリーバンクを読む**：
       - `mcp__serena__read_memory` で `codebase_structure` と `coding_conventions` を参照
       - プロジェクト全体のアーキテクチャと既存パターンを理解
    2. **類似コンポーネント/関数を検索**：
       - `mcp__serena__find_symbol` で既存の実装を検索
       - `Grep` ツールでキーワード検索
       - 既存コードを **必ず読んで** 既存コードのスタイル、構造、命名規則に従う
       - レポジトリ全体を通して、一貫性のある実装を心がける
    3. **重複チェック**：
       - 同じ機能が既に実装されていないか確認
       - 既存の関数/コンポーネントを再利用できないか検討
       - **車輪の再発明を絶対に避ける**
- **Linter警告を無視しない**

## 技術スタック

- **Hugo**: v0.152.2+extended（静的サイトジェネレーター）
- **テーマ**: Congo v2.12.2（Hugo Modules経由）
- **Go**: v1.25.3
- **Task**: go-task/task（ビルド自動化）
- **デプロイ**: Netlify
- **言語**: 日英バイリンガル

## 主要機能

### 1. Works ポートフォリオシステム

24件の会社実績（0000-0023）を紹介するカスタムコンテンツタイプ:

- カスタムメタデータ: `clients`（クライアント）、`collaborators`（協力者）、`references`（参考URL、任意）
- 構造化された画像命名規則: `{name}_thumbnail.jpg`, `{name}_key.jpg`, `{name}_sub.jpg`
- 日英バイリンガルコンテンツ
- カスタムアーキタイプ: `archetypes/works.md`

### 2. 背景アニメーション

「創発」と「共創」を表現するThree.jsベースのパーティクルネットワークアニメーション:

- 実装場所: `assets/js/emergence-network.js`
- 空間を漂う複数のパーティクル
- 近接パーティクル同士の動的な接続（共創の視覚化）
- 有機的な動きと色彩変化（創発の表現）
- マウスインタラクション対応

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

- デフォルト言語: 日本語（ja）
- 第二言語: 英語（en）
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
├── posts/           # ブログ記事（2記事）
├── works/           # ポートフォリオ（24プロジェクト、日英）
├── team/            # チームメンバー（1名）
├── about.{ja,en}.md # 会社概要ページ
├── contact.{ja,en}.md # お問い合わせページ
└── thanks.md        # フォーム送信完了ページ
```

## カスタムレイアウト

- `layouts/partials/extend-head.html` - 背景アニメーション統合
- `layouts/shortcodes/` - カスタムshortcode群
- `layouts/works/` - Worksポートフォリオ表示（将来的に大幅リデザイン予定）
- `archetypes/` - カスタムコンテンツテンプレート

## 開発ワークフロー

```bash
# 開発サーバー起動
task start

# 本番用アセットビルド
task build

# テスト実行
task test

# コード整形
task format

# Netlifyへデプロイ
task deploy
```

## 移行履歴

**日付**: 2025-11-01
**ブランチ**: feature/congo-migration

### 移行の目的

1. Congoテーマを v2.4.2（2022年11月）から v2.12.2（2025年7月）へ更新
2. git submodule から Hugo Modules へ切り替え
3. ビルドツールを Makefile から Taskfile へ移行
4. 非推奨の Vanta.js をカスタム Three.js アニメーションに置き換え
5. Congoの標準機能を可能な限り活用

### 主な変更点

- Hugo Modulesによるテーマ管理で更新が容易に
- 最新Three.jsを使用した背景アニメーションのモダン化
- Taskfileベースのビルド自動化
- カスタムshortcode（contactForm、mapboxGl）は維持
- Congo標準のfigure shortcodeを活用してコード簡素化

## セキュリティ

- 機密情報管理に `git-secret` を使用
- `.gitsecret/` ディレクトリに暗号化ファイルを格納
- 秘密情報の復号化: `make reveal` または移行後は `task reveal`

## 今後のメンテナンスに関する注意事項

1. **Worksポートフォリオ**: 現在はCongo標準レイアウトを使用。将来的に大幅なリデザインを予定。
2. **テーマ更新**: `hugo mod get -u` でCongoテーマを更新可能。
3. **カスタムShortcode**: サイト機能に必須。contactFormとmapboxGl shortcodeは削除しないこと。
4. **背景アニメーション**: カスタム実装。変更時はパフォーマンステストを推奨。
5. **バイリンガルコンテンツ**: 全コンテンツで必ず日英両バージョンを維持すること。

## リファレンス

- **ウェブサイト**: <https://sfz.dev/>
- **Congoテーマ**: <https://github.com/jpanther/congo>
- **Congoドキュメント**: <https://jpanther.github.io/congo/docs/>
