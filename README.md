# sfz.dev

<!-- Badges -->
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
    - [Install Hugo](#install-hugo)
    - [Install Congo](#install-congo)
  - [Start](#start)
  - [Document](#document)
    - [CHANGELOG](#changelog)
  - [Deploy](#deploy)
  - [Update Congo](#update-congo)
  - [Clean](#clean)
- [Misc](#misc)
- [Notes](#notes)
  - [LICENSE](#license)
  - [Contributors](#contributors)

## Prerequisites

- Go (v1.18 or higher)
  - Hugo (v.0.101.0 or higher)
    - [Congo](https://github.com/jpanther/congo)

## How to

```shell
$ make help
default              常用
setup                初期
open                 閲覧
hide                 秘匿
reveal               暴露
start                開始
deploy               配備
update               追随
clean                掃除
help                 助言
```

### First time preparation

```shell
make setup
```

#### Install Hugo

To install Hugo manually, run below.

```shell
brew install hugo
```

#### Install Congo

```shell
git submodule add -b stable https://github.com/jpanther/congo.git themes/congo
```

### Start

```shell
make
```

Then, web server is available at [http://0.0.0.0:1313/](http://0.0.0.0:1313/).
To open it, `make open`.

### Document

#### CHANGELOG

To install [git-cliff](https://github.com/orhun/git-cliff) via [Homebrew](https://brew.sh) manually, `brew install git-cliff`.

To update `CHANGELOG.md` manually, run [git-cliff](https://github.com/orhun/git-cliff) like below.

```shell
git cliff --output CHANGELOG.md
```

### Deploy

To deploy this to `(T. B. D.)` manually, run below.

```shell
make deploy
```

### Update Congo

See. [Congo official document](https://jpanther.github.io/congo/docs/installation/#installing-updates).

```shell
make update
```

### Clean

To clean up miscellaneous files, run below.

```shell
make clean
```

## Misc

## Notes

This repository is [Commitizen](https://commitizen.github.io/cz-cli/) friendly, following [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow).

### LICENSE

See [LICENSE](LICENSE).

### Contributors

- [sforzando LLC. and Inc.](https://sforzando.co.jp/)
  - [Shin'ichiro Suzuki](https://github.com/shin-sforzando)
