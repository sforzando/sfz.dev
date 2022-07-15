# -*- coding: utf-8 -*-

TIMESTAMP := $(shell date +%Y%m%d%H%M%S)
MAKEFILE_DIR := $(dir $(realpath $(firstword $(MAKEFILE_LIST))))
OS_NAME := $(shell uname -s)

OPEN_TARGET := http://0.0.0.0:1313/

OPTS :=
.DEFAULT_GOAL := default
.PHONY: default setup open hide reveal start build watch test ngrok deploy update endorse clean help

default: start ## 常用

setup: ## 初期
ifeq ($(OS_NAME),Darwin)
	brew install colordiff
	brew install direnv
	brew install git-cliff
	brew install git-secret
	brew install hugo
	brew install netlify-cli
	brew install --cask ngrok
endif
	npm install
	make reveal
	direnv allow
	@if [ $(OS_NAME) = "Darwin" ]; then say "The setup process is complete." ; fi

open: ## 閲覧
	@if [ $(OS_NAME) = "Darwin" ]; then open ${OPEN_TARGET} ; fi

hide: ## 秘匿
	git secret hide -vm

reveal: ## 暴露
	git secret reveal -vf

start: ## 開始
	@if [ $(OS_NAME) = "Darwin" ]; then say "Start the application." ; fi
	hugo server --buildDrafts --buildFuture --verbose

build: ## 構築
	NODE_ENV=production ./themes/congo/node_modules/tailwindcss/lib/cli.js --config ./themes/congo/tailwind.config.js --input ./themes/congo/assets/css/main.css --output ./assets/css/compiled/main.css --jit

watch: ## 監視
	NODE_ENV=development ./themes/congo/node_modules/tailwindcss/lib/cli.js --config ./themes/congo/tailwind.config.js --input ./themes/congo/assets/css/main.css --output ./assets/css/compiled/main.css --jit --watch

test: ## 試験
	npx playwright test --headed

ngrok: ## 転送
	@if [ $(OS_NAME) = "Darwin" ]; then say "Start transfer using ngrok." ; fi
	ngrok http 1313

deploy: ## 配備
	netlify init
	netlify deploy $(OPTS)
	@if [ $(OS_NAME) = "Darwin" ]; then say "The deployment process is complete." ; fi

update: ## 追随
	git submodule update --remote --merge

endorse: ## 裏書
	./utils/endorse.sh

clean: ## 掃除
	rm -rf test-results
	rm -rf tests/*.ts-snapshots
	@if [ $(OS_NAME) = "Darwin" ]; then say "The cleanup process is complete." ; fi

help: ## 助言
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
