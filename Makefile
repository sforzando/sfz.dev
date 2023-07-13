# -*- coding: utf-8 -*-

TIMESTAMP := $(shell date +%Y%m%d%H%M%S)
MAKEFILE_DIR := $(dir $(realpath $(firstword $(MAKEFILE_LIST))))
OS_NAME := $(shell uname -s)

OPEN_TARGET := http://0.0.0.0:1313/

OPTS :=
.DEFAULT_GOAL := default
.PHONY: default setup open hide reveal start ngrok test build deploy update clean help

default: start ## 常用

setup: ## 初期
ifeq ($(OS_NAME),Darwin)
	brew install direnv
	brew install git-cliff
	brew install git-secret
	brew install hugo
	brew install lefthook
	brew install netlify-cli
	brew install --cask ngrok
endif
	make reveal
	direnv allow
	npm install
	npx playwright install --with-deps
	@if [ $(OS_NAME) = "Darwin" ]; then say "The setup process is complete." ; fi

open: ## 閲覧
	@if [ $(OS_NAME) = "Darwin" ]; then open ${OPEN_TARGET} ; fi

hide: ## 秘匿
	git secret hide -vm

reveal: ## 暴露
	git secret reveal -vf

start: ## 開始
	@if [ $(OS_NAME) = "Darwin" ]; then say "Start the server." ; fi
	hugo server --buildDrafts --buildFuture --verbose

ngrok: ## 転送
	@if [ $(OS_NAME) = "Darwin" ]; then say "Start transfer using ngrok." ; fi
	ngrok http 1313

test: ## 試験
	npx playwright test --update-snapshots --headed
	@if [ $(OS_NAME) = "Darwin" ]; then say "The test process is complete." ; fi

build: ## 構築
	hugo --gc --ignoreCache --minify --logLevel debug
	@if [ $(OS_NAME) = "Darwin" ]; then say "The build process is complete." ; fi

deploy: ## 配備
	netlify init
	netlify deploy $(OPTS)
	@if [ $(OS_NAME) = "Darwin" ]; then say "The deployment process is complete." ; fi

update: ## 更新
	hugo mod get -u
	@if [ $(OS_NAME) = "Darwin" ]; then say "The update process is complete." ; fi

clean: ## 掃除
	rm -rf test-results
	rm -rf tests/*.ts-snapshots
	@if [ $(OS_NAME) = "Darwin" ]; then say "The cleanup process is complete." ; fi

help: ## 助言
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
