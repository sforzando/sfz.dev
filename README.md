# sfz.dev

<!-- Badges -->
[![Netlify Status](https://api.netlify.com/api/v1/badges/32df5ba4-1ddb-4439-b630-ec8964cc1735/deploy-status)](https://app.netlify.com/sites/sfzdev/deploys)
[![Last Commit](https://img.shields.io/github/last-commit/sforzando/sfz.dev)](https://github.com/sforzando/sfz.dev/graphs/commit-activity)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<!-- Screenshots -->
| ![Screenshot 1](https://placehold.jp/32/3d4070/ffffff/720x480.png?text=Screenshot%201) | ![Screenshot 2](https://placehold.jp/32/703d40/ffffff/720x480.png?text=Screenshot%202) |
|:--------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------:|
|                                      Screenshot 1                                      |                                      Screenshot 2                                      |

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
  - [Catch-up the latest Congo](#catch-up-the-latest-congo)
    - [Update](#update)
    - [Endorse](#endorse)
  - [Document](#document)
    - [CHANGELOG](#changelog)
  - [Clean](#clean)
- [Misc](#misc)
- [Notes](#notes)
  - [LICENSE](#license)
  - [Contributors](#contributors)

## Prerequisites

- Go (v1.18 or higher)
  - Hugo (v.0.101.0 or higher)
    - [Congo](https://github.com/jpanther/congo)
    - [Vanta.js](https://github.com/tengbao/vanta)
- Node.js
  - [Playwright](https://playwright.dev/)
- [Netlify](https://www.netlify.com)
  - [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Mapbox](https://www.mapbox.com)
  - [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/)

## How to

```shell
$ make help
default              常用
setup                初期
open                 閲覧
hide                 秘匿
reveal               暴露
start                開始
ngrok                転送
deploy               配備
update               追随
endorse              裏書
clean                掃除
help                 助言
```

### First time preparation

Prepare `.envrc` like this,

```.envrc
MAPBOX_ACCESS_TOKEN="xxxx"
```

Then, run `make setup`.

#### Introduce Congo

```shell
git submodule add -b stable https://github.com/jpanther/congo.git themes/congo
```

### Start

```shell
make
```

Then, web server is available at [http://0.0.0.0:1313/](http://0.0.0.0:1313/).
To open it, `make open`.

Transfer by ngrok is convenient for checking on a smartphone, use `make ngrok`.

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

E2E tests is available, `make test`.

### Deploy

To deploy this to [Netlify](https://www.netlify.com) manually, `make deploy`.

### Catch-up the latest Congo

#### Update

See. [Congo official document](https://jpanther.github.io/congo/docs/installation/#installing-updates).

```shell
make update
```

When the submodule is update, it may be necessary "Clear cache and deploy site." on Netlify.

#### Endorse

To confirm the differences from the latest update, `make endorse`.

### Document

#### CHANGELOG

To install [git-cliff](https://github.com/orhun/git-cliff) via [Homebrew](https://brew.sh) manually, `brew install git-cliff`.

To update `CHANGELOG.md` manually, run [git-cliff](https://github.com/orhun/git-cliff) like below.

```shell
git cliff --output CHANGELOG.md
```

### Clean

To clean up miscellaneous files, `make clean`.

## Misc

## Notes

This repository is [Commitizen](https://commitizen.github.io/cz-cli/) friendly, following [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow).

### LICENSE

See [LICENSE](LICENSE).

### Contributors

- [sforzando LLC. and Inc.](https://sforzando.co.jp/)
  - [Shin'ichiro Suzuki](https://github.com/shin-sforzando)
