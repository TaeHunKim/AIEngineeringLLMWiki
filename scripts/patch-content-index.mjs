#!/usr/bin/env node
// Patches public/static/contentIndex.json to include `order` from frontmatter.
// The community content-index plugin doesn't include `order` by default.
// Run this after `npx quartz build`.
import { readdir, readFile, writeFile } from "fs/promises"
import { join, relative } from "path"

const WIKI_DIR = "wiki"
const INDEX_PATH = "public/static/contentIndex.json"

async function* walkMd(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walkMd(full)
    else if (entry.name.endsWith(".md")) yield full
  }
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const out = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.+)/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

// Convert file path like wiki/AI/Engineering/Context_Engineering/Context_Compression.md
// → slug like ai/engineering/context_engineering/context_compression  (Quartz convention)
function filePathToSlug(filePath) {
  return relative(WIKI_DIR, filePath)
    .replace(/\.md$/, "")
    .toLowerCase()
    .replace(/\\/g, "/")
}

const orderMap = {}
for await (const file of walkMd(WIKI_DIR)) {
  const text = await readFile(file, "utf8")
  const fm = parseFrontmatter(text)
  if (fm.order !== undefined) {
    const order = Number(fm.order)
    if (!isNaN(order)) {
      orderMap[filePathToSlug(file)] = order
    }
  }
}

const index = JSON.parse(await readFile(INDEX_PATH, "utf8"))
let patched = 0
for (const [slug, entry] of Object.entries(index)) {
  if (orderMap[slug] !== undefined) {
    entry.order = orderMap[slug]
    patched++
  }
}
await writeFile(INDEX_PATH, JSON.stringify(index))
console.log(`Patched ${patched}/${Object.keys(index).length} entries with order field.`)
