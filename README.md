# sfz.dev

<!-- Badges -->

[![Netlify Status](https://api.netlify.com/api/v1/badges/32df5ba4-1ddb-4439-b630-ec8964cc1735/deploy-status)](https://app.netlify.com/sites/sfzdev/deploys)
[![Last Commit](https://img.shields.io/github/last-commit/sforzando/sfz.dev)](https://github.com/sforzando/sfz.dev/graphs/commit-activity)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<!-- Screenshots -->

| ![2022-08-09 01 42 31 sfz dev 8d4063d3fcf6](https://user-images.githubusercontent.com/32637762/183469678-e07a9d2f-ad62-4efd-bb42-ffbfe035b21d.png) | ![IMG_A8CD90C669D7-1](https://user-images.githubusercontent.com/32637762/183469789-fc7deb47-f6ca-4ebb-9d5c-c4c57314c97f.jpeg) |
| :------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: |
|                                                                         PC                                                                         |                                                              SP                                                               |

<!-- Synopsis -->

Official Corporate Web site of sforzando LLC. and Inc.

<!-- TOC -->

- [Prerequisites](#prerequisites)
- [How to](#how-to)
  - [First time preparation](#first-time-preparation)
    - [Introduce Congo](#introduce-congo)
  - [Start](#start)
    - [Dummy Articles](#dummy-articles)
  - [Test](#test)
  - [Deploy](#deploy)
  - [Update](#update)
    - [Dependencies](#dependencies)
    - [Congo](#congo)
  - [Document](#document)
    - [CHANGELOG](#changelog)
  - [Clean](#clean)
- [Toolchain](#toolchain)
  - [Code Quality](#code-quality)
  - [Git Hooks](#git-hooks)
  - [Build \& Development](#build--development)
- [Misc](#misc)
- [Notes](#notes)
  - [LICENSE](#license)
  - [Contributors](#contributors)

## Prerequisites

- Go (v1.25 or higher)
  - Hugo (v.0.146.0 or higher, **Extended version required**)
    - [Congo v2.12.2](https://github.com/jpanther/congo) (via Git submodule)
- Node.js (v24 or higher)
  - [Biome](https://biomejs.dev/) (v2.3.2)
  - [Prettier](https://prettier.io/) (v3.6.2) with go-template plugin
  - [Playwright](https://playwright.dev/)
- [Task](https://taskfile.dev/) (build automation)
- [Lefthook](https://github.com/evilmartians/lefthook) (git hooks)
- [Netlify](https://www.netlify.com)
  - [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Mapbox](https://www.mapbox.com)
  - [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/)

## How to

```shell
$ task --list
task: Available tasks for this project:
* default:               常用 - 開発サーバー起動
* build-css:             構築 - TailwindCSSをビルド
* clean:                 掃除 - テスト結果を削除
* deploy:                配備 - Netlifyへデプロイ
* format:                整形 - コードフォーマット実行
* hide:                  秘匿 - git-secretで秘密情報を暗号化
* ngrok:                 転送 - ngrokでローカルサーバーを公開
* open:                  閲覧 - ブラウザで開く
* reveal:                暴露 - git-secretで秘密情報を復号化
* setup:                 初期セットアップ
* start:                 開始 - Hugo開発サーバー起動
* test:                  試験 - Playwrightテスト実行
* update-dependencies:   追随 - 依存パッケージを更新
* update-theme:          追随 - Congoテーマを更新
```

### First time preparation

Prepare `.envrc` like this,

```.envrc
MAPBOX_ACCESS_TOKEN="xxxx"
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

The build uses Congo's own `themes/congo/tailwind.config.js`, which already includes content paths for the project root (`./layouts/**/*.html`, `./content/**/*.{html,md}`). This means:
- No need to create a separate tailwind.config.js in the project root
- The submodule remains clean and easy to update
- Custom TailwindCSS classes in project content are automatically detected

To manually build TailwindCSS:

```shell
task build-css
```

This compiles `themes/congo/assets/css/main.css` using `themes/congo/tailwind.config.js` and outputs to `assets/css/compiled/main.css`, which Hugo automatically uses instead of the theme's pre-compiled CSS.

### Start

```shell
task
# or
task start
```

Then, web server is available at [http://0.0.0.0:1313/](http://0.0.0.0:1313/).
To open it, `task open`.

Transfer by ngrok is convenient for checking on a smartphone, use `task ngrok`.

#### Dummy Articles

Generate dummy articles for testing.

```shell
for i in {0000..0023}; do
  for l in {en,ja}; do
    hugo new "works/${i}.ja.md"
  done
done
```

All dummy photos from [Unsplash](https://unsplash.com).

### Test

E2E tests is available, `task test`.

### Deploy

To deploy this to [Netlify](https://www.netlify.com) manually, `task deploy`.

### Update

#### Dependencies

```shell
task update-dependencies
```

#### Congo

To update the Congo theme to the latest stable version:

```shell
task update-theme
```

This executes:

```shell
git submodule update --remote --merge themes/congo
npm install --prefix themes/congo
```

After updating, rebuild TailwindCSS with `task build-css` or restart the dev server with `task start`.

### Document

#### CHANGELOG

To install [git-cliff](https://github.com/orhun/git-cliff) via [Homebrew](https://brew.sh) manually, `brew install git-cliff`.

To update `CHANGELOG.md` manually, run [git-cliff](https://github.com/orhun/git-cliff) like below.

```shell
git cliff --output CHANGELOG.md
```

### Clean

To clean up miscellaneous files, `task clean`.

## Toolchain

This project uses modern development tooling:

### Code Quality

- **[Biome](https://biomejs.dev/)** (v2.3.2) - Fast linter and formatter for JS/TS/JSON/CSS
  - `npm run format:biome` - Format code with Biome
  - `npm run lint` - Lint code with Biome
- **[Prettier](https://prettier.io/)** (v3.6.2) - HTML formatter with Go template support
  - `npm run format:html` - Format HTML files with Prettier

### Git Hooks

- **[Lefthook](https://github.com/evilmartians/lefthook)** (v2.0.2) - Fast Git hooks manager
  - Automatically runs `npm run format` and `task test` on pre-commit
  - Configuration: `.lefthook.yml`

### Build & Development

- **[Task](https://taskfile.dev/)** - Modern task runner (replaces Make)
  - Configuration: `Taskfile.yml`
- **[Hugo](https://gohugo.io/)** (v0.152.2+extended) - Static site generator
- **[Congo](https://github.com/jpanther/congo)** (v2.12.2) - Hugo theme via Git submodule
  - **[TailwindCSS](https://tailwindcss.com/)** (v3.4.17) - Built from source to support custom utility classes
  - Configuration: `themes/congo/tailwind.config.js`
  - Output: `assets/css/compiled/main.css`

## Misc

## Notes

This repository is [Commitizen](https://commitizen.github.io/cz-cli/) friendly, following [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow).

### LICENSE

See [LICENSE](LICENSE).

### Contributors

- [sforzando LLC. and Inc.](https://sforzando.co.jp/)
  - [Shin'ichiro Suzuki](https://github.com/shin-sforzando)
