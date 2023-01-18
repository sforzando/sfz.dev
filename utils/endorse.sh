#!/usr/bin/env bash

set -Eeuo pipefail
trap cleanup SIGINT SIGTERM ERR EXIT

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)

usage() {
  cat << EOF # remove the space between << and EOF, this is due to web plugin issue
Usage: $(basename "${BASH_SOURCE[0]}") [-h] [--no-color]

Script description here.

Available options:

-h, --help      Print this help and exit
-f, --force     Run with no prompts
--no-color      Output without color
EOF
  exit
}

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
}

setup_colors() {
  if [[ -t 2 ]] && [[ -z "${NO_COLOR-}" ]] && [[ "${TERM-}" != "dumb" ]]; then
    NOFORMAT='\033[0m' RED='\033[0;31m' GREEN='\033[0;32m' ORANGE='\033[0;33m' BLUE='\033[0;34m' PURPLE='\033[0;35m' CYAN='\033[0;36m' YELLOW='\033[1;33m'
  else
    NOFORMAT='' RED='' GREEN='' ORANGE='' BLUE='' PURPLE='' CYAN='' YELLOW=''
  fi
}

msg() {
  echo >&2 -e "${1-}"
}

die() {
  local msg=$1
  local code=${2-1} # default exit status 1
  msg "$msg"
  exit "$code"
}

parse_params() {
  while :; do
    case "${1-}" in
    -h | --help) usage ;;
    --no-color) NO_COLOR=1 ;;
    -f | --force) FORCE=1 ;;
    -?*) die "Unknown option: $1" ;;
    *) break ;;
    esac
    shift
  done

  args=("$@")
  return 0
}

FILE_COUNT=0
DIFFERENCE=0
DIFF_COUNT=0

endorse() {
  msg "${CYAN}Comparing... $1 $2${NOFORMAT}"
  exit_code=0
  if which colordiff > /dev/null 2>&1; then
    colordiff --side-by-side --suppress-common-lines $1 $2 || exit_code=$?
  else
    diff --side-by-side --suppress-common-lines $1 $2 || exit_code=$?
  fi
  msg "${CYAN}Exit: $exit_code${NOFORMAT}"
  if [ $exit_code -ge $DIFFERENCE ]; then
    DIFFERENCE=$exit_code
  fi
  if [ $exit_code -ne 0 ]; then
    DIFF_COUNT=$((DIFF_COUNT+1))
  fi
  if [[ -z "${FORCE-}" ]]; then
    read -p "Press any key to continue..."
  fi
  FILE_COUNT=$((FILE_COUNT+1))
}

parse_params "$@"
setup_colors

CONGO_PATH="./themes/congo"

# archetypes
endorse ./archetypes/default.md $CONGO_PATH/archetypes/default.md
endorse ./archetypes/external.md $CONGO_PATH/archetypes/external.md
# posts
endorse ./layouts/posts/list.html $CONGO_PATH/layouts/_default/list.html
endorse ./layouts/partials/posts/article-link.html $CONGO_PATH/layouts/partials/article-link.html
endorse ./layouts/posts/single.html $CONGO_PATH/layouts/_default/single.html
# works
endorse ./layouts/works/list.html $CONGO_PATH/layouts/_default/list.html
endorse ./layouts/partials/works/article-link.html $CONGO_PATH/layouts/partials/article-link.html
endorse ./layouts/works/single.html $CONGO_PATH/layouts/_default/single.html
# header
endorse ./layouts/partials/header/custom.html $CONGO_PATH/layouts/partials/header/basic.html
endorse ./layouts/partials/header/custom.html $CONGO_PATH/layouts/partials/header/hamburger.html
endorse ./layouts/partials/translations.html $CONGO_PATH/layouts/partials/translations.html
# shortcodes for figure
endorse ./layouts/shortcodes/figureWidthFull.html $CONGO_PATH/layouts/shortcodes/figure.html
# css
endorse ./assets/css/compiled/main.css $CONGO_PATH/assets/css/compiled/main.css

if [ $DIFFERENCE -ge 2 ]; then
  msg "${RED}Some errors occurred.${NOFORMAT}"
  exit 2
fi

if [ $DIFFERENCE -eq 1 ]; then
  msg "${ORANGE}Differences found in $DIFF_COUNT / $FILE_COUNT files.${NOFORMAT}"
  exit 1
fi
