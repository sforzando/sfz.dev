"use strict"

const fs = require("node:fs")
const path = require("node:path")

const reportPath = path.resolve(
  __dirname,
  "../lighthouse-reports/report.report.json"
)
const config = require("../lighthouse.config.cjs")

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"))
const { thresholds } = config

let hasError = false

for (const [category, { level, minScore }] of Object.entries(thresholds)) {
  const score = report.categories[category]?.score
  if (score === undefined) continue

  if (score < minScore) {
    const symbol = level === "error" ? "✘" : "⚠"
    console.log(
      `${symbol}  categories.${category} ${level} for minScore assertion`
    )
    console.log(`      expected: >= ${minScore}`)
    console.log(`         found: ${score}`)
    if (level === "error") hasError = true
  } else {
    console.log(`✔  categories.${category}: ${score}`)
  }
}

if (hasError) process.exit(1)
