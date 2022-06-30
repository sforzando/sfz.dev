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

endorse() {
  msg "${CYAN}Comparing... $1 $2${NOFORMAT}"
  if which colordiff > /dev/null 2>&1; then
    colordiff --side-by-side --suppress-common-lines $1 $2 || exit_code=$?
  else
    diff --side-by-side --suppress-common-lines $1 $2 || exit_code=$?
  fi
  msg "${CYAN}Exit: $exit_code${NOFORMAT}"
  if [ $exit_code -ge $DIFFERENCE ]; then
    DIFFERENCE=$exit_code
  fi
  if [[ -z "${FORCE-}" ]]; then
    read -p "Press any key to continue..."
  fi
}

parse_params "$@"
setup_colors

DIFFERENCE=0

endorse ./archetypes/default.md ./themes/congo/archetypes/default.md
endorse ./archetypes/external.md ./themes/congo/archetypes/external.md
endorse ./layouts/works/list.html ./themes/congo/layouts/_default/list.html
endorse ./layouts/partials/header/custom.html ./themes/congo/layouts/partials/header/basic.html
endorse ./layouts/partials/header/custom.html ./themes/congo/layouts/partials/header/hamburger.html
endorse ./layouts/partials/translations.html ./themes/congo/layouts/partials/translations.html
endorse ./assets/css/compiled/main.css ./themes/congo/assets/css/compiled/main.css

if [ $DIFFERENCE -ge 2 ]; then
  msg "${RED}Some errors occurred.${NOFORMAT}"
  exit 2
fi

if [ $DIFFERENCE -eq 1 ]; then
  msg "${ORANGE}Differences were found.${NOFORMAT}"
  exit 1
fi
