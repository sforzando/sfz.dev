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
    -?*) die "Unknown option: $1" ;;
    *) break ;;
    esac
    shift
  done

  args=("$@")
  return 0
}

parse_params "$@"
setup_colors

msg "${CYAN}Diff:${NOFORMAT}"
DIFFERENCE=0
set -x
diff --side-by-side ./archetypes/default.md ./themes/congo/archetypes/default.md || DIFFERENCE=$?
diff --side-by-side ./archetypes/external.md ./themes/congo/archetypes/external.md || DIFFERENCE=$?
diff --side-by-side ./layouts/partials/header.html ./themes/congo/layouts/partials/header.html || DIFFERENCE=$?
diff --side-by-side ./layouts/partials/translations.html ./themes/congo/layouts/partials/translations.html || DIFFERENCE=$?
set +x

if [ $DIFFERENCE -ge 2 ]; then
  msg "${RED}Some errors occurred.${NOFORMAT}"
  exit 2
fi

if [ $DIFFERENCE -eq 1 ]; then
  msg "${ORANGE}Differences were found.${NOFORMAT}"
  exit 1
fi

