# Congo Theme v2.14.0 アップデート実装計画

> **Note:** ファイル名は当初Hugoバージョン名のような形になっているが、実際の対象はCongoテーマ v2.13.0 → v2.14.0 のアップデート。

## Context（背景）

sforzando公式サイト（sfz.dev）が使用しているCongoテーマの v2.14.0 が2026-05-23にリリースされた。現在 v2.13.0 を使用中であり、最新版に追随する。

**v2.14.0 主要変更点**（[公式リリースノート](https://github.com/jpanther/congo/releases/tag/v2.14.0)）:

- ⚠️ Hugo 最低要件が v0.158.0 以上に引き上げ
- KaTeX v0.17.0 / Mermaid v11.15.0 へアップグレード
- 多言語ページで `hreflang` 自動宣言（SEO改善）
- Hindi/Gujarati 翻訳追加
- Hugo v0.156.0 で deprecated になった `Site.Languages` を `Rotate "language"` 方式に移行
- 各種バグ修正（taxonomy単独表示、pagination float値、Author警告、deprecated language parameter警告）

**sfz.devへの影響**:

1. Hugo は現在 v0.161.1+extended で要件をクリア済み
2. 自前で当てていた `layouts/_partials/functions/warnings.html` の Author警告削除パッチが、上流の修正（PR #1165）と重複するため不要になる
3. `config/_default/languages.{en,ja}.toml` のキー名は旧形式（`languageCode`/`languageName`/`rtl`）のままだが、Congo exampleSiteでは新形式（`locale`/`label`/`direction`）が使われているため、機を捉えて移行
4. カスタムレイアウト多数あるが、Congoの言語API変更（`.Site.Languages` 関連）に依存しているものは無いことを確認済み

**Goal**: Congoテーマを v2.14.0 へ更新し、上流の改善を取り込みつつ不要になった上書きを整理する。Playwright/Lighthouseテストでリグレッションが無いことを確認する。

---

## 影響ファイル

### 変更（Modify）

- `themes/congo`（submoduleのcommit参照を v2.13.0 → v2.14.0 に更新）
- `config/_default/languages.en.toml:1-6`（言語設定キーを新形式に移行）
- `config/_default/languages.ja.toml:1-6`（言語設定キーを新形式に移行）
- `README.md:45`（Congoバージョン表記を v2.14.0 へ更新）
- `CLAUDE.md:30`（Congoバージョン表記を v2.14.0 へ更新）

### 削除（Delete）

- `layouts/_partials/functions/warnings.html`（上流の v2.14.0 が同じ修正を取り込み、オーバーライド不要に）

### 影響なし（Verify only）

- `layouts/partials/extend-head.html`
- `layouts/partials/tag-cloud.html`
- `layouts/shortcodes/contactForm{Jpn,Eng}.html`
- `layouts/shortcodes/mapboxGl.html`
- `layouts/{posts,tags,teams,works}/*.html`
- `tailwind.config.js`（Congoの `require()` を継続）

---

## 既存資産の活用

- `task update:theme`（`Taskfile.yml:179-184`）: submodule更新 + Congoのnpm install + `check:layouts` を自動実行
- `task check:layouts`（`Taskfile.yml:174-177`）→ `scripts/check-layout-overrides.sh`: 上書きされているカスタムレイアウトを検出し、`diff` で差分表示
- `scripts/check-versions.sh`: Congo/Hugo/Goの現/最新バージョンを確認
- `task test:headless`: Playwright E2Eテスト一式（pre-commitフックでも自動実行される）
- `task lighthouse`: Lighthouseパフォーマンス計測

---

## タスク

### Task 0: Issue起票

**手順**:

- [ ] **Step 1: GitHub Issueを起票**

タイトル: `feat: ✨ Congoテーマ v2.14.0 へのアップデート`（actual Unicode emoji使用、`:sparkles:` テキストは不可）

本文テンプレート（`.github/ISSUE_TEMPLATE/feat.md` ベース）:

```markdown
## 概要

Congoテーマを v2.13.0 → v2.14.0 へアップデートする。

## 背景

2026-05-23 に Congo v2.14.0 がリリースされた。
リリースノート: https://github.com/jpanther/congo/releases/tag/v2.14.0

主要変更:
- Hugo 最低要件 v0.158.0 以上（現状 v0.161.1 でクリア済み）
- KaTeX v0.17.0 / Mermaid v11.15.0
- 多言語ページの hreflang 自動宣言
- `Site.Languages` → `Rotate "language"` 移行
- Author警告などのバグ修正

## やること

- [ ] `task update:theme` でCongoを v2.14.0 へ更新
- [ ] `task check:layouts` でオーバーライド差分を確認
- [ ] `layouts/_partials/functions/warnings.html` のオーバーライドを削除（上流で同じ修正取り込み済み）
- [ ] `config/_default/languages.{en,ja}.toml` を新キー名（`locale`/`label`/`direction`）に移行
- [ ] `README.md` と `CLAUDE.md` のバージョン表記を更新
- [ ] Playwright/Lighthouseテストで動作確認
- [ ] CHANGELOG更新
```

- [ ] **Step 2: Issue番号を控える**

例: Issue #65（実際の番号に応じて変わる）

---

### Task 1: ブランチ作成

**Files**: なし

- [ ] **Step 1: Issue番号に応じたブランチを作成**

```bash
# Issue番号を3桁ゼロ埋め + 機能名 で命名（CLAUDE.mdのルール準拠）
git checkout -b 065_update_congo_v2_14_0
```

期待: `Switched to a new branch '065_update_congo_v2_14_0'`

---

### Task 2: Congoテーマsubmoduleの更新

**Files**:

- Modify: `themes/congo`（submodule pointer）

- [ ] **Step 1: 現バージョン確認（事前スナップショット）**

```bash
git submodule status themes/congo
```

期待出力に `(v2.13.0)` が含まれることを確認。

- [ ] **Step 2: `task update:theme` を実行**

```bash
task update:theme
```

実行内容（`Taskfile.yml:179-184`）:

1. `git submodule update --remote --merge themes/congo` で stable ブランチ最新へ追随
2. `npm install --prefix themes/congo` でCongo側依存を再インストール
3. `task: check:layouts` で上書き状況のdiffを表示

- [ ] **Step 3: バージョンがv2.14.0に上がったことを確認**

```bash
git submodule status themes/congo
jq -r .version themes/congo/package.json
```

期待: `(v2.14.0)` および `2.14.0`

- [ ] **Step 4: `check-layout-overrides.sh` の出力を確認**

上書きされているファイルとして `_partials/functions/warnings.html` が検出されるはず。`diff` 結果に着目し、上流が Author警告ブロックを削除済みなら、sfz.dev側のオーバーライドは不要と判断する（Task 3で削除）。

---

### Task 3: 不要になった warnings.html オーバーライド削除

**Files**:

- Delete: `layouts/_partials/functions/warnings.html`

**根拠**: Congo v2.14.0 の `layouts/_partials/functions/warnings.html` は Author警告ブロック（`{{ if .Author }} ... {{ end }}`）を削除済み。sfz.devのオーバーライド（このAuthor警告ブロックを削除する目的）は上流修正で重複となるため削除する。

- [ ] **Step 1: 上流と現オーバーライドの差分を最終確認**

```bash
diff themes/congo/layouts/_partials/functions/warnings.html layouts/_partials/functions/warnings.html
```

期待: コメント行 `{{- /*`.Author`check omitted: ... */ -}}` の有無くらいしか差が無いこと（ロジックは同等）。

- [ ] **Step 2: オーバーライドを削除**

```bash
rm layouts/_partials/functions/warnings.html
# 親ディレクトリが空になる場合は併せて削除
rmdir layouts/_partials/functions 2>/dev/null || true
rmdir layouts/_partials 2>/dev/null || true
```

- [ ] **Step 3: 削除後の状態確認**

```bash
ls layouts/_partials/functions/ 2>&1 || echo "removed"
bash scripts/check-layout-overrides.sh
```

期待: `No custom layouts override Congo theme files.` または、`_partials/functions/warnings.html` がオーバーライド一覧から消えている。

---

### Task 4: 言語設定キー名の新形式への移行

**Files**:

- Modify: `config/_default/languages.en.toml:1-6`
- Modify: `config/_default/languages.ja.toml:1-6`

**根拠**: Congo v2.14.0 の exampleSite は新キー名（`locale`/`label`/`direction`）を使用。旧キー名（`languageCode`/`languageName`/`rtl`）も Hugo は受け付けるが deprecation 警告が出る。将来除去に備えて移行する。`displayName` と `isoCode` はテンプレート参照が無いカスタム/未使用パラメータのため、整理ついでに削除も検討（保守的に残す案を採用）。

- [ ] **Step 1: `config/_default/languages.en.toml` の先頭ブロック更新**

変更前（行1-6）:

```toml
languageCode = "en"
languageName = "English"
displayName = ":us: To Eng"
isoCode = "en"
weight = 1
rtl = false
```

変更後:

```toml
locale = "en"
label = "English"
displayName = ":us: To Eng"
isoCode = "en"
weight = 1
direction = "ltr"
```

- [ ] **Step 2: `config/_default/languages.ja.toml` の先頭ブロック更新**

変更前（行1-6）:

```toml
languageCode = "ja"
languageName = "日本語"
displayName = ":jp: To Jpn"
isoCode = "ja"
weight = 2
rtl = false
```

変更後:

```toml
locale = "ja"
label = "日本語"
displayName = ":jp: To Jpn"
isoCode = "ja"
weight = 2
direction = "ltr"
```

- [ ] **Step 3: 設定ファイルの構文確認**

```bash
hugo config | grep -E '(locale|label|direction)'
```

期待: enとjaの両方で新キー名が反映されていること。

---

### Task 5: Hugoビルド検証

**Files**: なし（実行のみ）

- [ ] **Step 1: 警告含むHugoビルドを実行**

```bash
task build 2>&1 | tee /tmp/hugo-build.log
```

- [ ] **Step 2: ビルドログをチェック**

```bash
grep -iE 'deprecated|warn|error' /tmp/hugo-build.log || echo "no warnings"
```

期待:

- deprecated警告が消えている、または減っている
- ERROR は出ていない

deprecated警告が残った場合は具体的なメッセージを確認し、追加修正の要否を判断する。

- [ ] **Step 3: 開発サーバーで目視確認**

```bash
task start
# 別ターミナル/ブラウザで:
# - トップページ (en/ja 両言語切替確認)
# - /posts/ ページ
# - /works/ ページ
# - /teams/ ページ
# - /tags/ ページ
# - /contact/ ページ（フォームの存在確認）
# - 背景アニメーション動作確認
# - タグクラウド動作確認
task stop
```

期待: 全ページが警告/エラー無しで表示され、視覚的に v2.13.0 と比較して崩れが無い。

---

### Task 6: Playwright E2Eテスト

**Files**:

- Update: `tests/snapshots/`（スナップショット更新が必要なら）

- [ ] **Step 1: ヘッドレスでフルテスト実行**

```bash
task test:headless
```

期待: 全テストpass。スナップショット差分が出た場合は、視覚的に意図した差分か（hreflang追加などDOM変更）を確認したうえで `--update-snapshots` （`task test:headless` には既に付与済み）で更新を許容。

- [ ] **Step 2: 差分が大きい場合の判断**

予期しない差分（例: ヘッダ崩れ、フォント変化など）が出た場合は、原因をCongoのCHANGELOGや差分から特定。問題があれば本タスクをロールバックし、別途調査する。

---

### Task 7: Lighthouseパフォーマンス計測

**Files**: なし

- [ ] **Step 1: Lighthouse実行**

```bash
task lighthouse
```

期待: アサーションスコアをクリア（`scripts/lighthouse-assert.cjs` が失敗しない）。

---

### Task 8: ドキュメント更新

**Files**:

- Modify: `README.md:45`
- Modify: `CLAUDE.md:30`

- [ ] **Step 1: README.md のバージョン表記更新**

変更前（行45）:

```markdown
    - [Congo v2.13.0](https://github.com/jpanther/congo) (via Git submodule)
```

変更後:

```markdown
    - [Congo v2.14.0](https://github.com/jpanther/congo) (via Git submodule)
```

- [ ] **Step 2: CLAUDE.md のバージョン表記更新**

変更前（行30）:

```markdown
- **テーマ**: Congo v2.13.0（git submodule経由）
```

変更後:

```markdown
- **テーマ**: Congo v2.14.0（git submodule経由）
```

---

### Task 9: CHANGELOG更新

**Files**:

- Modify: `CHANGELOG.md`

- [ ] **Step 1: `task update:changelog` 実行**

```bash
task update:changelog
```

`git-cliff` がコミット履歴から自動生成する。

- [ ] **Step 2: 生成結果を確認**

```bash
head -30 CHANGELOG.md
```

期待: 新規エントリーにCongo更新コミットが反映されていること。

---

### Task 10: コミットとPR

**Files**: なし（Git操作のみ）

> **注意**: CLAUDE.mdのルールにより、コミット/プッシュ/PR作成は**ユーザー操作が基本**。Claude Codeはここで停止し、ユーザーに引き継ぐ。pre-commitフック（Lefthook）で `task format` / `task lint:markdown` / `task test:headless` が自動実行されるため、コミット時に数分かかる。

- [ ] **Step 1: 変更内容の最終確認（ユーザー作業）**

```bash
git status
git diff
git diff --cached
```

- [ ] **Step 2: コミット（cz-emoji形式、`~/.czrc` 準拠、ユーザー作業）**

例:

```bash
git add -- themes/congo config/_default/languages.en.toml config/_default/languages.ja.toml README.md CLAUDE.md CHANGELOG.md
git rm layouts/_partials/functions/warnings.html
git commit -m "feat: :arrow_up: update Congo theme to v2.14.0"
```

メッセージは `{type}: :{emoji}: {subject}` 形式必須（独自emojiコード禁止、`~/.czrc` 定義のもののみ）。

- [ ] **Step 3: PR作成（ユーザー作業）**

```bash
git push -u origin 065_update_congo_v2_14_0
gh pr create --title "feat: ✨ Congoテーマ v2.14.0 へのアップデート" --body "..."
```

PRタイトルは actual Unicode emoji（`✨`）を使用。`:sparkles:` 表記不可。

---

## 検証チェックリスト（最終）

- [ ] `git submodule status themes/congo` が `(v2.14.0)` を出力
- [ ] `task check:layouts` で `_partials/functions/warnings.html` がオーバーライド一覧から消えている
- [ ] `hugo config` で `locale`/`label`/`direction` が新キー名で出力される
- [ ] `task build` がwarning/errorを出さない（または既知のもののみ）
- [ ] `task test:headless` 全テストpass
- [ ] `task lighthouse` アサーションpass
- [ ] 開発サーバーで日英両言語のページが正しく表示
- [ ] 背景アニメーション / タグクラウド / View Transitions が動作
- [ ] お問い合わせフォーム / Mapbox shortcode が表示

---

## ロールバック手順

問題が発生した場合:

```bash
# submoduleを元のcommitに戻す
git checkout 3623fa505ee42fee899844d94a4ff7f5a1ae9096 -- themes/congo
git submodule update --init --recursive

# 言語設定とドキュメントを元に戻す
git checkout main -- config/_default/languages.en.toml config/_default/languages.ja.toml README.md CLAUDE.md

# 削除した warnings.html を復元
git checkout main -- layouts/_partials/functions/warnings.html
```

---

## 参考リンク

- Congo v2.14.0 リリースノート: <https://github.com/jpanther/congo/releases/tag/v2.14.0>
- PR #1162 (Site.Languages deprecation migration): <https://github.com/jpanther/congo/pull/1162>
- PR #1165 (Author warning fix): <https://github.com/jpanther/congo/pull/1165>
- Hugo v0.156.0 deprecation notes: <https://discourse.gohugo.io/t/deprecations-in-v0-156-0/56732>
