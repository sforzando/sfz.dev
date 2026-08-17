import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { fakerEN, fakerJA } from "@faker-js/faker"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = join(__dirname, "..")

const VALID_TYPES = ["works", "posts"] as const
type ContentType = (typeof VALID_TYPES)[number]

const CREDIT_ROLES = ["PM", "Program", "Design", "Direction", "Development"]
const POSTS_TAGS = [
  "tech",
  "hugo",
  "typescript",
  "javascript",
  "css",
  "design",
  "frontend",
  "backend",
  "api",
  "devops",
  "netlify",
  "node",
  "react",
  "python",
]
const JA_REFERENCE_NAMES = [
  "プロジェクト紹介記事",
  "関連技術ドキュメント",
  "メディア掲載",
  "受賞歴",
  "プレスリリース",
  "導入事例インタビュー",
  "公式ウェブサイト",
]

const IMG_SPECS = [
  { suffix: "thumbnail", w: 1920, h: 1923 },
  { suffix: "key", w: 1920, h: 1280 },
  { suffix: "sub", w: 1920, h: 1440 },
] as const

function dateForIndex(index: number, count: number): string {
  const oneDayMs = 24 * 60 * 60 * 1000
  const jitterMs = fakerEN.number.int({ min: -6, max: 6 }) * 60 * 60 * 1000
  // index 0 = oldest, index count-1 = newest
  return toHugoDate(
    new Date(Date.now() - (count - 1 - index) * oneDayMs + jitterMs)
  )
}

function toHugoDate(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return jst
    .toISOString()
    .replace("Z", "+09:00")
    .replace(/\.\d{3}/, "")
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`fetch failed: ${response.status} ${url}`)
  const buf = await response.arrayBuffer()
  writeFileSync(destPath, Buffer.from(buf))
}

function buildClientsYaml(names: string[], urls: (string | null)[]): string {
  return names
    .map((name, i) => {
      const url = urls[i]
      return url
        ? `  - name: "${name}"\n    url: "${url}"`
        : `  - name: "${name}"`
    })
    .join("\n")
}

function buildCollaboratorsYaml(
  names: string[],
  urls: (string | null)[],
  creditsPerCollaborator: string[][]
): string {
  return names
    .map((name, i) => {
      const url = urls[i]
      const urlLine = url ? `\n    url: "${url}"` : ""
      const credits = creditsPerCollaborator[i]
        .map((c) => `      - "${c}"`)
        .join("\n")
      return `  - name: "${name}"${urlLine}\n    credits:\n${credits}`
    })
    .join("\n")
}

interface WorksSharedData {
  clientCount: number
  clientUrls: (string | null)[]
  collaboratorCount: number
  collaboratorUrls: (string | null)[]
  creditsPerCollaborator: string[][]
  refCount: number
  refUrls: string[]
  bodyParagraphsEn: [string, string]
  bodyParagraphsJa: [string, string]
}

function generateWorksShared(): WorksSharedData {
  const clientCount = fakerEN.number.int({ min: 1, max: 3 })
  const clientUrls = Array.from({ length: clientCount }, () =>
    fakerEN.datatype.boolean() ? fakerEN.internet.url() : null
  )

  const collaboratorCount = fakerEN.number.int({ min: 1, max: 3 })
  const collaboratorUrls = Array.from({ length: collaboratorCount }, () =>
    fakerEN.datatype.boolean() ? fakerEN.internet.url() : null
  )
  const creditsPerCollaborator = Array.from(
    { length: collaboratorCount },
    () => {
      const n = fakerEN.number.int({ min: 1, max: 3 })
      return Array.from({ length: n }, () => {
        const role = fakerEN.helpers.arrayElement(CREDIT_ROLES)
        return `${role}: placeholder`
      })
    }
  )

  const refCount = fakerEN.number.int({ min: 0, max: 3 })
  const refUrls = Array.from({ length: refCount }, () => fakerEN.internet.url())

  const bodyParagraphsEn: [string, string] = [
    fakerEN.lorem.paragraphs(2, "\n\n"),
    fakerEN.lorem.paragraphs(2, "\n\n"),
  ]
  const bodyParagraphsJa: [string, string] = [
    fakerJA.lorem.paragraphs(2, "\n\n"),
    fakerJA.lorem.paragraphs(2, "\n\n"),
  ]

  return {
    clientCount,
    clientUrls,
    collaboratorCount,
    collaboratorUrls,
    creditsPerCollaborator,
    refCount,
    refUrls,
    bodyParagraphsEn,
    bodyParagraphsJa,
  }
}

function generateWorks(
  baseName: string,
  date: string
): { en: string; ja: string } {
  const shared = generateWorksShared()
  const { clientUrls, collaboratorUrls, bodyParagraphsEn, bodyParagraphsJa } =
    shared

  const enClientNames = Array.from({ length: shared.clientCount }, () =>
    fakerEN.company.name()
  )
  const enCollaboratorNames = Array.from(
    { length: shared.collaboratorCount },
    () => fakerEN.company.name()
  )
  const enCredits = shared.creditsPerCollaborator.map((credits) =>
    credits.map((c) => c.replace("placeholder", fakerEN.person.lastName()))
  )
  const enRefNames = Array.from({ length: shared.refCount }, () =>
    fakerEN.lorem.words(fakerEN.number.int({ min: 2, max: 5 }))
  )

  const jaClientNames = Array.from({ length: shared.clientCount }, () =>
    fakerJA.company.name()
  )
  const jaCollaboratorNames = Array.from(
    { length: shared.collaboratorCount },
    () => fakerJA.company.name()
  )
  const jaCredits = shared.creditsPerCollaborator.map((credits) =>
    credits.map((c) => c.replace("placeholder", fakerJA.person.lastName()))
  )
  const jaRefNames = fakerEN.helpers.arrayElements(
    JA_REFERENCE_NAMES,
    shared.refCount
  )

  const enClients = buildClientsYaml(enClientNames, clientUrls)
  const jaClients = buildClientsYaml(jaClientNames, clientUrls)
  const enCollaborators = buildCollaboratorsYaml(
    enCollaboratorNames,
    collaboratorUrls,
    enCredits
  )
  const jaCollaborators = buildCollaboratorsYaml(
    jaCollaboratorNames,
    collaboratorUrls,
    jaCredits
  )

  const enRefs =
    shared.refCount > 0
      ? `references:\n${enRefNames.map((name, i) => `  - name: "${name}"\n    url: "${shared.refUrls[i]}"`).join("\n")}\n`
      : ""
  const jaRefs =
    shared.refCount > 0
      ? `references:\n${jaRefNames.map((name, i) => `  - name: "${name}"\n    url: "${shared.refUrls[i]}"`).join("\n")}\n`
      : ""

  const commonFrontmatter = `draft: true
sharingLinks: false
showAuthor: true
showDate: true
showDateUpdated: false
showReadingTime: false
showTaxonomies: true
showTableOfContents: false
showWordCount: false

tags:
  - "works"`

  const bodyEn = `
{{< figure src="../img/works/${baseName}/key.jpg" alt="${baseName}" >}}

${bodyParagraphsEn[0]}

{{< figure class="w-screen" src="../img/works/${baseName}/sub.jpg" alt="${baseName}" >}}

${bodyParagraphsEn[1]}

{{< figure src="../img/works/${baseName}/sub.jpg" alt="${baseName}" >}}
`

  const bodyJa = `
{{< figure src="../img/works/${baseName}/key.jpg" alt="${baseName}" >}}

${bodyParagraphsJa[0]}

{{< figure class="w-screen" src="../img/works/${baseName}/sub.jpg" alt="${baseName}" >}}

${bodyParagraphsJa[1]}

{{< figure src="../img/works/${baseName}/sub.jpg" alt="${baseName}" >}}
`

  const en = `---
title: "${baseName}"
date: ${date}
${commonFrontmatter}
clients:
${enClients}
collaborators:
${enCollaborators}
${enRefs}thumbnail: "img/works/${baseName}/thumbnail.jpg"
---
${bodyEn}`

  const ja = `---
title: "${baseName}"
date: ${date}
${commonFrontmatter}
clients:
${jaClients}
collaborators:
${jaCollaborators}
${jaRefs}thumbnail: "img/works/${baseName}/thumbnail.jpg"
---
${bodyJa}`

  return { en, ja }
}

function generatePosts(
  baseName: string,
  date: string
): { en: string; ja: string } {
  const tagCount = fakerEN.number.int({ min: 1, max: 3 })
  const tags = fakerEN.helpers.arrayElements(POSTS_TAGS, tagCount)
  const tagLines = tags.map((t) => `  - "${t}"`).join("\n")

  const sectionCount = fakerEN.number.int({ min: 2, max: 4 })

  const enSections = Array.from({ length: sectionCount }, () => {
    const heading = fakerEN.lorem.sentence(
      fakerEN.number.int({ min: 3, max: 7 })
    )
    const body = fakerEN.lorem.paragraphs(
      fakerEN.number.int({ min: 1, max: 3 }),
      "\n\n"
    )
    return `## ${heading}\n\n${body}`
  }).join("\n\n")

  const jaSections = Array.from({ length: sectionCount }, () => {
    const heading = fakerJA.lorem.sentence(
      fakerEN.number.int({ min: 3, max: 7 })
    )
    const body = fakerJA.lorem.paragraphs(
      fakerEN.number.int({ min: 1, max: 3 }),
      "\n\n"
    )
    return `## ${heading}\n\n${body}`
  }).join("\n\n")

  const commonFrontmatter = `---
title: "${baseName}"
date: ${date}
draft: true
sharingLinks: ["facebook", "twitter", "pinterest", "reddit", "linkedin", "email"]
showAuthor: true
showDate: true
showDateUpdated: true
showReadingTime: true
showTaxonomies: true
showTableOfContents: true
showWordCount: true

tags:
${tagLines}
thumbnail: "img/posts/${baseName}.jpg"
---

{{< figure src="../img/posts/${baseName}.jpg" alt="${baseName}" >}}
`

  const en = `${commonFrontmatter}
${fakerEN.lorem.paragraphs(2, "\n\n")}

${enSections}
`

  const ja = `${commonFrontmatter}
${fakerJA.lorem.paragraphs(2, "\n\n")}

${jaSections}
`

  return { en, ja }
}

async function runWorks(count: number, force: boolean): Promise<void> {
  const contentDir = join(REPO_ROOT, "content", "works")
  const imgDir = join(REPO_ROOT, "assets", "img", "works")

  for (let i = 0; i < count; i++) {
    const padded = String(i).padStart(4, "0")
    const baseName = `dummy_${padded}`
    const enPath = join(contentDir, `${baseName}.en.md`)
    const jaPath = join(contentDir, `${baseName}.ja.md`)

    const mdExists = existsSync(enPath) || existsSync(jaPath)
    if (mdExists && !force) {
      process.stdout.write(`  skip:    ${baseName}\n`)
      continue
    }

    const { en, ja } = generateWorks(baseName, dateForIndex(i, count))
    writeFileSync(enPath, en, "utf-8")
    writeFileSync(jaPath, ja, "utf-8")
    process.stdout.write(`  created: ${baseName}.en.md, ${baseName}.ja.md\n`)

    // Each work owns a directory for its three images, so the asset tree stays
    // navigable as the portfolio grows instead of flattening into one listing.
    const workImgDir = join(imgDir, baseName)
    mkdirSync(workImgDir, { recursive: true })

    for (const { suffix, w, h } of IMG_SPECS) {
      const imgPath = join(workImgDir, `${suffix}.jpg`)
      if (!existsSync(imgPath) || force) {
        const seed = `${baseName}-${suffix}`
        const url = `https://picsum.photos/seed/${seed}/${w}/${h}.jpg`
        await downloadImage(url, imgPath)
        process.stdout.write(`  downloaded: ${baseName}/${suffix}.jpg\n`)
      }
    }
  }
}

async function runPosts(count: number, force: boolean): Promise<void> {
  const contentDir = join(REPO_ROOT, "content", "posts")
  const imgDir = join(REPO_ROOT, "assets", "img", "posts")

  for (let i = 0; i < count; i++) {
    const padded = String(i).padStart(4, "0")
    const baseName = `dummy_${padded}`
    const enPath = join(contentDir, `${baseName}.en.md`)
    const jaPath = join(contentDir, `${baseName}.ja.md`)

    const mdExists = existsSync(enPath) || existsSync(jaPath)
    if (mdExists && !force) {
      process.stdout.write(`  skip:    ${baseName}\n`)
      continue
    }

    const { en, ja } = generatePosts(baseName, dateForIndex(i, count))
    writeFileSync(enPath, en, "utf-8")
    writeFileSync(jaPath, ja, "utf-8")
    process.stdout.write(`  created: ${baseName}.en.md, ${baseName}.ja.md\n`)

    const imgPath = join(imgDir, `${baseName}.jpg`)
    if (!existsSync(imgPath) || force) {
      const url = `https://picsum.photos/seed/${baseName}/1920/1280.jpg`
      await downloadImage(url, imgPath)
      process.stdout.write(`  downloaded: ${baseName}.jpg\n`)
    }
  }
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2)
  const force = rawArgs.includes("--force")
  const positional = rawArgs.filter((a) => !a.startsWith("--"))
  const [contentType, countStr] = positional

  if (
    !VALID_TYPES.includes(contentType as ContentType) ||
    countStr === undefined
  ) {
    process.stderr.write(
      "Usage: npx tsx scripts/gen-dummy.ts <works|posts> <count> [--force]\n"
    )
    process.exit(1)
  }

  const count = parseInt(countStr, 10)
  if (Number.isNaN(count) || count < 1) {
    process.stderr.write("Error: count must be a positive integer\n")
    process.exit(1)
  }

  process.stdout.write(
    `Generating ${count} dummy ${contentType} page(s)${force ? " (force)" : ""}...\n`
  )

  if (contentType === "works") {
    await runWorks(count, force)
  } else {
    await runPosts(count, force)
  }

  process.stdout.write("Done.\n")
}

main().catch((err) => {
  process.stderr.write(`${String(err)}\n`)
  process.exit(1)
})
