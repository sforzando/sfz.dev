# Congo v2.13.0 移行計画書

**作成日**: 2025-11-01
**ブランチ**: feature/congo-migration
**目的**: Congoテーマの更新とビルドツールのモダン化

---

## 背景

### 現状の課題

- **Congoテーマのバージョンが古い**: v2.4.2（2022年11月）を使用中
- **Vanta.js背景アニメーションの問題**: 3年以上開発停止、最新Three.jsで動作不可
- **ビルドツール**: Makefileを使用中、よりモダンなTaskfileへ移行したい

### 移行の目標

1. Congoテーマを最新版（v2.13.0）へ更新
2. git submodule から Hugo Modules へ切り替え（公式推奨の方法）
3. Makefileを Taskfile に置き換え
4. Vanta.jsをカスタムThree.js実装に置き換え（「創発」「共創」のコンセプト表現）
5. Congo標準機能を最大限活用してカスタムコードを削減

---

## 環境情報

### 現在の環境

- **Hugo**: v0.152.2+extended
- **Go**: v1.25.3
- **Task**: インストール済み（/opt/homebrew/bin/task）
- **Congo**: v2.4.2（git submodule）

### 移行後の環境

- **Hugo**: v0.160.1+extended+withdeploy
- **Go**: v1.26.2
- **Congo**: v2.13.0（Hugo Modules）
- **ビルドツール**: Taskfile

---

## コンテンツ資産

### 保持すべき重要な資産

- **Worksポートフォリオ**: 24プロジェクト × 日英 = 48ファイル + 大量の画像
- **ブログ記事**: 2記事 × 日英 = 4ファイル
- **チーム情報**: 1名 × 日英 = 2ファイル
- **固定ページ**: about, contact, thanks（日英）
- **カスタムshortcode**: contactForm（日英）、mapboxGl
- **カスタムアーキタイプ**: works.md（クライアント・協力者・参考URL対応）
- **多言語設定**: 細かい日英設定
- **アナリティクス設定**: Google Analytics、Fathom Analytics
- **Netlify設定**: ドメインリダイレクト、ビルド設定

**結論**: ゼロからのセットアップより移行の方が5〜10倍効率的

---

## カスタムShortcode分析

### 1. figureWidthFull.html

**Congo標準との比較**:

- 95%の機能がCongo標準の `figure` shortcodeと同一
- 唯一の違い: `w-screen` クラス（全幅表示）

**対応方針**:

- Congo標準の `figure` shortcode使用時に `class="w-screen"` を追加
- カスタムshortcode削除でコード簡素化

### 2. contactFormJpn.html / contactFormEng.html

**Congo標準との比較**:

- Congo v2.13.0にフォーム機能なし

**対応方針**:

- **維持必須**（Netlify Forms統合、ビジネスロジック）

### 3. mapboxGl.html

**Congo標準との比較**:

- Congo v2.13.0に地図機能なし

**対応方針**:

- **維持必須**（専用機能、3D地球儀、デュアル拠点表示）

---

## 移行手順

### Phase 0: プロジェクト文脈の記録

- [x] CLAUDE.md 作成
- [x] MIGRATION_PLAN.md 作成（本ファイル）

### Phase 1: ブランチ作成

- [x] `git checkout -b feature/congo-migration` 実行

### Phase 2: Hugo Modules 移行

- [x] `hugo mod init github.com/sforzando/sfz.dev` 実行
- [x] `config/_default/module.toml` に Congo v2 import追加
- [x] `config/_default/config.toml` から `theme = "congo"` 行削除
- [x] `git rm themes/congo` でサブモジュール削除
- [x] `.gitmodules` からCongoエントリ削除

### Phase 3: 設定ファイル更新

- [x] `netlify.toml`: Hugo 0.152.2 明記
- [x] `config/_default/module.toml`: 最小バージョン 0.146.0 設定
- [x] `config/_default/params.toml`: Congo v2.13.0新パラメータ追加
  - `header.logo`
  - `header.showTitle`
  - その他新機能パラメータ
- [x] ESLint、Stylelint、Prettierの代わりにBiomeに移行

### Phase 4: Taskfile 作成

- [x] `Taskfile.yml` 新規作成
- [x] Makefileから以下のタスクを移植:
  - `setup`: 初期セットアップ
  - `start`: 開発サーバー起動
  - `build`: TailwindCSSビルド（Hugo modules cache対応）
  - `watch`: TailwindCSS watch
  - `format`: コード整形
  - `test`: Playwright テスト
  - `deploy`: Netlifyデプロイ
  - `clean`: 一時ファイル削除
  - `reveal`: git-secret復号化
  - `hide`: git-secret暗号化
- [x] `Makefile` 削除

### Phase 5: Shortcode整理

- [x] `figureWidthFull` shortcode削除
- [x] 全コンテンツファイルで以下の置換:

  ```html
  {{< figureWidthFull ... >}}
  ↓
  {{< figure class="w-screen" ... >}}
  ```

- [x] `contactFormJpn.html`, `contactFormEng.html` を最適化
  - `@tailwindcss/forms` に非依存であることを確認、基本Tailwindクラスのみで動作
- [x] `mapboxGl.html` は維持

### Phase 6: 創発的背景アニメーション実装

- [x] `package.json` に最新Three.jsを追加
- [x] `assets/js/emergence-network.js` 新規作成:
  - パーティクルシステム実装
  - パーティクル間の動的接続（共創の視覚化）
  - 有機的な動きと色彩変化（創発の表現）
  - マウスインタラクション
- [x] `layouts/partials/extend-head.html` 書き換え:
  - 新しいThree.js実装を読み込み（js.Build + fingerprint）
  - VantaWaves関連コード削除
- [x] 古いファイル削除:
  - `assets/js/vanta.waves.js`
  - `assets/js/three.js`（古いバージョン）
- [x] Congo v2.13.0対応: `layouts/_partials/functions/warnings.html` オーバーライド
  - Hugo v0.147+で削除された `site.Author` フィールド参照を除去
- [x] `assets/js/background-waves.ts` クリック/タッチ散乱エフェクト追加:
  - クリック点を中心に頂点が鳥のように散乱（±67.5°ランダム方向 + Y羽ばたき振動）
  - 過減衰スプリング物理で波アニメーション位置へ自動帰還
  - Raycasterによるメッシュローカル座標変換
  - Playwright回帰テスト追加（chromium/firefox/webkit/モバイル 20/20 pass）

### Phase 7: テストと検証

- [x] `task start` で開発サーバー起動
- [ ] 全ページの表示確認（日英両言語）:
  - [ ] Top
  - [x] About
  - [ ] Contact
  - [x] Works（24件全て）
  - [x] Posts（2件）
  - [ ] Teams
- [x] 背景アニメーション動作確認:
  - [x] 波メッシュ表示
  - [x] クリック散乱インタラクション
  - [x] マウスによるカメラ追従
- [ ] カスタムshortcode動作確認:
  - [ ] contactFormJpn
  - [ ] contactFormEng
  - [ ] mapboxGl（Kawasaki、Vancouver両方）
- [x] `task build` で本番ビルド成功確認
- [x] `task test` でPlaywrightテスト実行（20/20 pass）
- [ ] Lighthouseでパフォーマンス測定
- [ ] Playwright E2Eテストの拡充
  - [ ] English
    - [ ] Top
    - [ ] About
    - [ ] Contact
    - [ ] Works
      - [ ] List
      - [ ] Detail
    - [ ] Posts
      - [ ] List
      - [ ] Detail
    - [ ] Teams
  - [ ] Japanese
    - [ ] Top
    - [ ] About
    - [ ] Contact
    - [ ] Works
      - [ ] List
      - [ ] Detail
    - [ ] Posts
      - [ ] List
      - [ ] Detail
    - [ ] Teams

### Phase 8: デプロイ

- [ ] `git push origin feature/congo-migration`
- [ ] GitHub上でPR作成:
  - タイトル: "feat: Migrate to Congo v2.13.0 with Hugo Modules and Taskfile"
  - 説明: 本ドキュメントの要約を記載
- [ ] PRレビュー
- [ ] mainブランチへマージ
- [ ] Netlify自動デプロイ監視
- [ ] 本番環境の全ページ動作確認
- [ ] パフォーマンス確認

---

## Breaking Changes 対応

### Hugo Extended必須化

- **Congo v2.4.2**: Hugo 0.87.0+（non-extended可）
- **Congo v2.13.0**: Hugo 0.146.0+ Extended **必須**
- **当環境**: v0.152.2+extended インストール済み ✅

### レイアウト構造変更

- Congo v2.12.0でテンプレート構造が変更
- カスタムレイアウトの互換性確認必要

### Author設定の移動

- author設定が `params.author` に移動
- `config/_default/params.toml` で設定確認・更新

---

## リスク管理

### 低リスク

- Hugo、Go、Task は既にインストール済み
- コンテンツファイル（.md）はテーマ非依存
- カスタムshortcodeは独立して動作

### 中リスク

- TailwindCSSビルドパスの変更（submodule → modules cache）
- 背景アニメーションの新規実装（動作・パフォーマンステスト必要）

### 高リスク

- **なし**（別ブランチで作業、問題があればロールバック可能）

---

## ロールバック手順

万が一問題が発生した場合:

1. mainブランチに戻る: `git checkout main`
2. 移行ブランチ削除: `git branch -D feature/congo-migration`
3. 古い環境で継続作業可能

---

## 参考資料

- [Congo Theme GitHub](https://github.com/jpanther/congo)
- [Congo Documentation](https://jpanther.github.io/congo/docs/)
- [Hugo Modules Documentation](https://gohugo.io/hugo-modules/)
- [Taskfile Documentation](https://taskfile.dev/)
- [Three.js Documentation](https://threejs.org/docs/)

---

## チェックリスト

### 移行前確認

- [x] 環境確認（Hugo, Go, Task）
- [x] コンテンツ資産の把握
- [x] カスタムshortcode分析
- [x] CLAUDE.md作成
- [x] MIGRATION_PLAN.md作成

### 移行中

- [x] 各Phase完了時にコミット作成
- [ ] 問題発生時は本ドキュメントに記録
- [ ] テスト結果を記録

### 移行後

- [ ] 本番環境動作確認
- [ ] パフォーマンス測定結果記録
- [ ] 本ドキュメント最終更新
