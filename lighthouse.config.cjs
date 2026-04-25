"use strict"

// Skip audits that require server-side headers unavailable in local static serving
const LOCAL_SKIP_AUDITS = ["uses-text-compression", "uses-long-cache-ttl"]

module.exports = {
  extends: "lighthouse:default",
  // Score thresholds for assertion (not used by Lighthouse itself, read by scripts/lighthouse-assert.cjs)
  thresholds: {
    performance: { level: "warn", minScore: 0.8 },
    accessibility: { level: "warn", minScore: 0.8 },
    "best-practices": { level: "warn", minScore: 0.8 },
    seo: { level: "warn", minScore: 0.8 },
  },
  settings: {
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    skipAudits: LOCAL_SKIP_AUDITS,
    output: ["html", "json"],
    formFactor: "desktop",
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      requestLatencyMs: 0,
      downloadThroughputKbps: 10240,
      uploadThroughputKbps: 0,
      cpuSlowdownMultiplier: 1,
    },
    throttlingMethod: "simulate",
  },
}
