# sfz.dev

<!-- Badges -->

[![Netlify Status](https://api.netlify.com/api/v1/badges/32df5ba4-1ddb-4439-b630-ec8964cc1735/deploy-status)](https://app.netlify.com/sites/sfzdev/deploys)
[![Last Commit](https://img.shields.io/github/last-commit/sforzando/sfz.dev)](https://github.com/sforzando/sfz.dev/graphs/commit-activity)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<!-- Screenshots -->

| PC | SP |
| :---: | :---: |
| ![PC](https://github.com/user-attachments/assets/8740185f-3315-4472-afef-aae157ebd815) | ![SP](https://github.com/user-attachments/assets/0e19b348-67db-40aa-ba5b-244314572223) |

<!-- Synopsis -->

Official Corporate Web site of sforzando LLC. and Inc.

<!-- TOC -->

- [Prerequisites](#prerequisites)
- [How to](#how-to)
  - [First time preparation](#first-time-preparation)
    - [Introduce Congo](#introduce-congo)
  - [Start](#start)
  - [Generate Dummy Content](#generate-dummy-content)
  - [Test](#test)
  - [Deploy](#deploy)
  - [Update](#update)
    - [Dependencies](#dependencies)
    - [Congo](#congo)
  - [Document](#document)
    - [CHANGELOG](#changelog)
  - [Clean](#clean)
- [Misc](#misc)
- [Notes](#notes)
  - [LICENSE](#license)
  - [Contributors](#contributors)

## Prerequisites

- Go (v1.26 or higher)
  - Hugo (**Extended version required**)
    - [Congo v2.14.0](https://github.com/jpanther/congo) (via Git submodule)
- Node.js (v24 or higher)
  - [Biome](https://biomejs.dev/)
  - [Prettier](https://prettier.io/) with go-template plugin
  - [Playwright](https://playwright.dev/)
- [Task](https://taskfile.dev/) (build automation)
- [Lefthook](https://github.com/evilmartians/lefthook) (git hooks)
- [Netlify](https://www.netlify.com)
  - [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Mapbox](https://www.mapbox.com)
  - [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/)
- [draw.io](https://www.drawio.com/) (only needed to edit the diagrams in `assets/img/works/*/`)

## How to

```shell
$ task --list
task: Available tasks for this project:
* build:                     構築 - 本番用静的サイトをビルド
* clean:                     掃除 - テスト結果を削除
* default:                   一覧 - タスクの一覧を表示
* deploy:                    配備 - Netlifyへデプロイ
* format:                    整形 - コードフォーマット実行
* install:                   導入 - 依存パッケージをインストール
* lighthouse:                試験 - Lighthouseパフォーマンス計測（本番ビルドで実行、スコアアサーション付き）
* open:                      閲覧 - ブラウザで開く
* outdated:                  点検 - 依存パッケージの更新を確認
* restart:                   再起 - Hugo開発サーバーを再起動
* setup:                     初回 - 初期セットアップ
* start:                     開始 - Hugo開発サーバー起動（LAN内スマホからもアクセス可）      (aliases: dev)
* stop:                      停止 - Hugo開発サーバーを全て停止
* test:                      試験 - ローカルサーバーでPlaywrightテスト実行
* typecheck:                 検査 - TypeScriptの型を検査
* build:css:                 構築 - TailwindCSSをビルド
* build:diagrams:            構築 - draw.io図をSVGへ書き出し（ex. task build:diagrams -- assets/img/works/flipples/architecture.drawio）
* check:layouts:             点検 - Congoテーマのレイアウトオーバーライドを確認
* generate:dummy:            生成 - テスト用ダミーコンテンツを生成（ex. task generate:dummy -- works 5）
* gs:hide:                   秘匿 - git-secretで秘密情報を暗号化
* gs:reveal:                 暴露 - git-secretで秘密情報を復号化
* install:ci:                導入 - CI環境用依存パッケージをインストール
* lint:ci:                   検査 - CI環境で全Linterを検査（修正はしない）
* lint:markdown:             検査 - Markdownlintでマークダウンを検査
* lint:typos:                検査 - typosで綴りを検査しUS英語へ修正
* outdated:versions:         点検 - ツール（Congo/Hugo/Go）のバージョンを確認
* test:ci:                   試験 - CI環境でPlaywrightテスト実行
* test:headless:             試験 - ローカルサーバーでPlaywrightテスト実行（ヘッドレスモード）
* test:prod:                 試験 - 本番サーバーでPlaywrightテスト実行
* test:verify:               試験 - スナップショットを更新せず厳密比較（回帰検出用）
* update:changelog:          記録 - CHANGELOGを更新
* update:dependencies:       追随 - 依存パッケージを更新
* update:theme:              追随 - Congoテーマを更新
```

### First time preparation

Prepare `.envrc` like this,

```.envrc
export MAPBOX_ACCESS_TOKEN="xxxx"
export GITHUB_TOKEN="xxxx"
```

Then, run `task setup`.

#### Introduce Congo

Congo theme is managed as a Git submodule at `themes/congo/`.

The theme is automatically initialized when you run `task setup`, which executes:

```shell
git submodule update --init --recursive
npm install --prefix themes/congo
```

**TailwindCSS Build**: Congo uses TailwindCSS, which must be built from source to support custom utility classes used in this project. The build process is automatically triggered when you run `task start`.

The build uses `tailwind.config.js` at the project root, which extends Congo's own `themes/congo/tailwind.config.js` via `require()` without modifying the submodule. This allows project-level customizations (e.g. font family) to be layered on top of Congo's defaults while keeping `themes/` clean.

Current customizations in `tailwind.config.js`:

- **Font**: Noto Sans JP (loaded via Google Fonts in `layouts/partials/extend-head.html`) set as `fontFamily.sans`, with `fontFeatureSettings: '"palt"'` for proportional spacing of Japanese characters

To manually build TailwindCSS:

```shell
task build-css
```

This compiles `themes/congo/assets/css/main.css` using `tailwind.config.js` and outputs to `assets/css/compiled/main.css`, which Hugo automatically uses instead of the theme's pre-compiled CSS.

### Start

```shell
task start
```

Then, web server is available at [http://0.0.0.0:1313/](http://0.0.0.0:1313/).
To open it, `task open`.

### Generate Dummy Content

Generate dummy content for testing layouts and snapshots.

```shell
task generate:dummy -- works 5
task generate:dummy -- posts 3
```

Use `--force` to overwrite existing files.

```shell
task generate:dummy -- works 5 --force
```

> **Warning**: `--force` overwrites existing dummy files without confirmation.

Dummy photos for `works` are automatically downloaded from [Lorem Picsum](https://picsum.photos).

### Diagrams

Diagrams under `assets/img/works/` keep both an editable source (`*.drawio`) and the exported `*.svg` that articles reference. After editing a source, re-export it:

```shell
task build:diagrams
```

With no arguments every `*.drawio` under `assets/img/` is exported. Pass a path to export a single file.

```shell
task build:diagrams -- assets/img/works/flipples/architecture.drawio
```

This task is deliberately not a dependency of `task build`: the exported SVGs are committed, so CI builds the site without needing the draw.io CLI.

Two constraints apply because the SVG is displayed with `<img>`:

- Keep `html=0` in the shape styles, otherwise labels are emitted as `<foreignObject>` and the file roughly doubles in size.
- Keep node labels on a single line. The `<text>` fallback used by `<img>` does not wrap, so long labels overflow their nodes.

### Test

E2E tests is available, `task test`.

Note that `task test`, `task test:headless` and `task test:prod` all run with
`--update-snapshots`, so they rewrite the stored screenshots instead of
comparing against them. To detect a visual regression, use `task test:verify`,
which compares strictly without updating anything.

```shell
task test:verify
```

### Typecheck

TypeScript is transpiled by Hugo's `js.Build` (esbuild) and by `tsx`, neither of
which checks types. Run the type checker explicitly:

```shell
task typecheck
```

### Spelling

[typos](https://github.com/crate-ci/typos) keeps the English on this site in US
spelling. It is configured in `_typos.toml` with `locale = "en-us"`, which is
what makes it reject `colour`, `behaviour` and `optimised` <!-- spellchecker:disable-line -->
— at its default locale typos accepts every English dialect and catches none
of them.

```shell
task lint:typos
```

The binary comes from Homebrew (`brew install typos-cli`, installed by
`task setup`) because typos publishes no npm package. The pre-commit hook runs
this task and restages what it rewrote, and CI runs the same check through the
`crate-ci/typos` action, which annotates the offending lines in the pull
request diff.

`_typos.toml` excludes `themes/` (Congo is a submodule), `content/**/dummy_*`
(Faker.js writes Latin lorem ipsum that reads as misspelled English) and
`CHANGELOG.md` (generated from commit subjects). Prose that has to quote a
misspelling — the paragraph above, for instance — can end the line with
`<!-- spellchecker:disable-line -->` to opt that line out.

### Lint

`task lint:ci` runs Biome, Prettier, markdownlint and `tsc --noEmit` in
check-only mode — the same set the `Lint` workflow runs on every pull request.
Unlike `task format` and `task lint:markdown` it never writes to the working
tree, so it is safe to run to find out whether CI will pass.

```shell
task lint:ci
```

### Deploy

To deploy this to [Netlify](https://www.netlify.com) manually, `task deploy`.

### Update

#### Dependencies

```shell
task update:dependencies
```

#### Congo

To update the Congo theme to the latest stable version:

```shell
task update:theme
```

This executes:

```shell
git submodule update --remote --checkout themes/congo
npm install --prefix themes/congo
```

After updating, rebuild TailwindCSS with `task build-css` or restart the dev server with `task start`.

### Document

#### CHANGELOG

To install [git-cliff](https://github.com/orhun/git-cliff) via [Homebrew](https://brew.sh) manually, `brew install git-cliff`.

To update `CHANGELOG.md`, run:

```shell
task update:changelog
```

### Clean

To clean up miscellaneous files, `task clean`.

## Misc

## Notes

This repository is [Commitizen](https://commitizen.github.io/cz-cli/) friendly, following [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow).

### LICENSE

See [LICENSE](LICENSE).

### Contributors

- [sforzando LLC. and Inc.](https://sforzando.co.jp/)
  - [Shin'ichiro Suzuki](https://github.com/shin-sforzando)
