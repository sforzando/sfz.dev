#!/usr/bin/env bash
# Detects custom layouts that override Congo theme files at the same path.
# Run after `task update-theme` to find layouts that may need reconciliation.

THEME_DIR="themes/congo/layouts"
CUSTOM_DIR="layouts"

overrides=()

while IFS= read -r -d '' custom_file; do
  rel="${custom_file#"${CUSTOM_DIR}/"}"
  theme_file="${THEME_DIR}/${rel}"
  if [ -f "$theme_file" ]; then
    overrides+=("$rel")
  fi
done < <(find "$CUSTOM_DIR" -name "*.html" -print0 | sort -z)

if [ ${#overrides[@]} -eq 0 ]; then
  printf "\nNo custom layouts override Congo theme files.\n\n"
  exit 0
fi

printf "\n%d layout override(s) detected. Review diffs against current theme:\n\n" "${#overrides[@]}"

for rel in "${overrides[@]}"; do
  printf "  layouts/%s\n" "$rel"
done
printf "\n"

for rel in "${overrides[@]}"; do
  printf "── layouts/%s ──────────────────────────────\n" "$rel"
  diff --color=always "${THEME_DIR}/${rel}" "${CUSTOM_DIR}/${rel}" || true
  printf "\n"
done
