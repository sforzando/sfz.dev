#!/usr/bin/env bash
# Compares locally installed tool versions against their latest GitHub/go.dev releases.

CONGO_CURRENT=$(jq -r .version themes/congo/package.json)
CONGO_LATEST=$(curl -sf https://api.github.com/repos/jpanther/congo/releases/latest | jq -r '.tag_name | ltrimstr("v")') || CONGO_LATEST="(fetch failed)"

HUGO_CURRENT=$(hugo version | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1 | tr -d 'v')
HUGO_LATEST=$(curl -sf https://api.github.com/repos/gohugoio/hugo/releases/latest | jq -r '.tag_name | ltrimstr("v")') || HUGO_LATEST="(fetch failed)"

GO_CURRENT=$(go version | grep -oE 'go[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1 | tr -d 'go')
GO_LATEST=$(curl -sf 'https://go.dev/dl/?mode=json' | jq -r '.[0].version | ltrimstr("go")') || GO_LATEST="(fetch failed)"

printf "\nTool versions:\n\n"

check() {
  local name="$1" current="$2" latest="$3"
  if [ "$current" = "$latest" ]; then
    printf "  %-6s %s  ✓  up to date\n" "$name" "$current"
  else
    printf "  %-6s %s  →  %s  ⬆  update available\n" "$name" "$current" "$latest"
  fi
}

check "Congo" "$CONGO_CURRENT" "$CONGO_LATEST"
check "Hugo"  "$HUGO_CURRENT"  "$HUGO_LATEST"
check "Go"    "$GO_CURRENT"    "$GO_LATEST"

printf "\n"
