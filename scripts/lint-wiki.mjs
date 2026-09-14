#!/usr/bin/env node
// Lints the wiki/ markdown tree for defects that are easy to introduce by hand
// and invisible until the site is rendered. Run before committing wiki changes:
//   npm run lint:wiki
//
// Rules (see wiki/AI/SCHEMA.md "Lint (유지보수) 규칙" for the rationale):
//   L1  table-cell wikilinks must escape the alias pipe as \|
//   L2  every wikilink target must resolve to a real .md file
//   L3  wiki/AI and wiki/en/AI must contain the same file set
//   L4  order:/nav_order: must match between the KO and EN copy of a page
//   L5  files under wiki/en/ must link with the en/ prefix
//   L6  body prose must not narrate the wiki's own gaps or edit history
//   L7  wikilinks must not sit inside a fenced code block (they render as raw text)
//
// Suppress a single line with a trailing comment:  <!-- lint-ignore: L5,L6 -->
import { readdir, readFile } from "fs/promises"
import { join, relative } from "path"

const WIKI_DIR = "wiki"
const KO_ROOT = "wiki/AI"
const EN_ROOT = "wiki/en/AI"
// These two exist only in the KO tree by design and are meta-documentation
// about the wiki itself, so L3 and L6 do not apply to them.
const META_FILES = new Set(["log.md", "SCHEMA.md"])

async function* walkMd(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walkMd(full)
    else if (entry.name.endsWith(".md")) yield full
  }
}

const toPosix = (p) => p.split("\\").join("/")

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

// Blank out fenced code blocks and inline code spans so that syntax *examples*
// inside backticks are not mistaken for real links or real prose.
function stripCode(text) {
  return text
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length))
}

const findings = []
const report = (rule, file, line, message, excerpt) =>
  findings.push({ rule, file: toPosix(file), line, message, excerpt })

const ignoredRules = (rawLine) => {
  const m = rawLine.match(/<!--\s*lint-ignore:\s*([^>]*?)\s*-->/)
  return m ? new Set(m[1].split(/[,\s]+/).filter(Boolean)) : new Set()
}

// Body prose must describe the subject, not the wiki's own history.
// Cross-references ("이 위키의 [[X]] 문서가 …") and source attribution
// ("이 위키의 기존 소스") are established conventions and stay allowed.
const SELF_REFERENCE_PATTERNS = [
  /공백을 채운/,
  /이 위키에 없었/,
  /이 위키에는[^.\n]{0,80}없[었다]/,
  /문서가 없었다/,
  /앞선 \d+개 문서/,
  /이 챕터의 앞선 문서/,
  /위키 전체 최대/,
  /정본 역할/,
  /스스로를? (?:정의했듯|명시했던 것처럼|명시한 것처럼)/,
  // Sweeping claims about the wiki's own composition. Pointing at one specific
  // sibling page ("이 위키의 [[X]] 문서가 …") stays allowed.
  /이 위키의 모든/,
  /every[^.\n]{0,40}document in this wiki/i,
  /fills that gap/i,
  /had no document/i,
  /there was no document/i,
  /this wiki lacked/i,
  /largest in the wiki/i,
  /\bthe (?:six |6 )?preceding documents in this chapter\b/i,
]

const files = []
for await (const f of walkMd(WIKI_DIR)) files.push(f)
files.sort()

// Slug set used by L2: path relative to wiki/, minus the .md extension.
const slugs = new Set(files.map((f) => toPosix(relative(WIKI_DIR, f)).replace(/\.md$/, "")))

const frontmatter = new Map()

for (const file of files) {
  const raw = await readFile(file, "utf8")
  const rawLines = raw.split(/\r?\n/)
  const codeless = stripCode(raw).split(/\r?\n/)
  // Track fence membership separately: L7 needs to look *inside* fences, while
  // every other rule reads the code-stripped copy.
  const inFence = []
  {
    let open = false
    for (const l of rawLines) {
      if (l.trimStart().startsWith("```")) {
        open = !open
        inFence.push(false)
      } else inFence.push(open)
    }
  }
  const posix = toPosix(file)
  const base = posix.split("/").pop()
  const isMeta = META_FILES.has(base)
  const isEn = posix.startsWith("wiki/en/")

  frontmatter.set(posix, parseFrontmatter(raw))

  rawLines.forEach((rawLine, idx) => {
    const lineNo = idx + 1
    const skip = ignoredRules(rawLine)
    const line = codeless[idx] ?? ""
    const isTableRow = line.trim().startsWith("|")

    for (const m of line.matchAll(/\[\[([^\]]+?)\]\]/g)) {
      const inner = m.group ?? m[1]
      const link = m[0]

      // L1 — inside a table an unescaped | ends the cell and truncates the link
      if (isTableRow && /(?<!\\)\|/.test(inner) && !skip.has("L1")) {
        report("L1", file, lineNo, "표 셀 안 wikilink의 파이프를 \\| 로 이스케이프해야 합니다", link)
      }

      const target = inner.replace(/\\\|/g, "|").split("|")[0].split("#")[0].trim()
      if (!target) continue

      // L2 — dangling target
      if (!slugs.has(target) && !skip.has("L2")) {
        report("L2", file, lineNo, `링크 대상이 존재하지 않습니다: ${target}`, link)
      }

      // L5 — an EN page linking into the KO tree
      if (isEn && /^AI\//.test(target) && !skip.has("L5")) {
        report("L5", file, lineNo, `EN 문서의 링크에 en/ 접두사가 빠졌습니다: ${target}`, link)
      }
    }

    // L7 — a wikilink inside a fence is never rendered; it shows as raw [[path|alias]]
    if (!isMeta && inFence[idx] && !skip.has("L7")) {
      const m = rawLine.match(/\[\[[^\]]+?\]\]/)
      if (m) {
        report("L7", file, lineNo, "코드 블록 안 wikilink는 링크로 렌더링되지 않습니다", m[0])
      }
    }

    // L6 — gap / edit-history narration in body prose
    if (!isMeta && !skip.has("L6")) {
      for (const re of SELF_REFERENCE_PATTERNS) {
        const hit = line.match(re)
        if (hit) {
          report("L6", file, lineNo, "본문에 위키의 결핍·편집 이력을 서술했습니다", hit[0])
          break
        }
      }
    }
  })
}

// L3 / L4 — KO and EN trees must mirror each other
const rel = (root, f) => toPosix(relative(root, f))
const koFiles = new Set(
  files.filter((f) => toPosix(f).startsWith(KO_ROOT + "/")).map((f) => rel(KO_ROOT, f)),
)
const enFiles = new Set(
  files.filter((f) => toPosix(f).startsWith(EN_ROOT + "/")).map((f) => rel(EN_ROOT, f)),
)

for (const f of koFiles) {
  if (META_FILES.has(f.split("/").pop()) && !f.includes("/")) continue
  if (!enFiles.has(f)) report("L3", `${KO_ROOT}/${f}`, 0, "대응하는 EN 문서가 없습니다", "")
}
for (const f of enFiles) {
  if (!koFiles.has(f)) report("L3", `${EN_ROOT}/${f}`, 0, "대응하는 KO 문서가 없습니다", "")
}
for (const f of koFiles) {
  if (!enFiles.has(f)) continue
  const ko = frontmatter.get(`${KO_ROOT}/${f}`) ?? {}
  const en = frontmatter.get(`${EN_ROOT}/${f}`) ?? {}
  for (const key of ["order", "nav_order"]) {
    if (ko[key] !== en[key]) {
      report(
        "L4",
        `${KO_ROOT}/${f}`,
        0,
        `${key} 값이 KO/EN 간 다릅니다 (KO=${ko[key] ?? "없음"}, EN=${en[key] ?? "없음"})`,
        "",
      )
    }
  }
}

const RULE_LABEL = {
  L1: "표 셀 wikilink 파이프 미이스케이프",
  L2: "끊어진 링크",
  L3: "KO/EN 파일 집합 불일치",
  L4: "KO/EN order 불일치",
  L5: "EN 문서의 en/ 접두사 누락",
  L6: "본문 자기참조·결핍 서술",
  L7: "코드 블록 안 wikilink (렌더링 안 됨)",
}

if (findings.length === 0) {
  console.log(`✓ lint-wiki: ${files.length}개 파일, 위반 0건`)
  process.exit(0)
}

const byRule = new Map()
for (const f of findings) {
  if (!byRule.has(f.rule)) byRule.set(f.rule, [])
  byRule.get(f.rule).push(f)
}

for (const rule of Object.keys(RULE_LABEL)) {
  const list = byRule.get(rule)
  if (!list) continue
  console.log(`\n${rule} — ${RULE_LABEL[rule]} (${list.length}건)`)
  for (const f of list) {
    const where = f.line ? `${f.file}:${f.line}` : f.file
    console.log(`  ${where}\n      ${f.message}${f.excerpt ? `\n      ${f.excerpt}` : ""}`)
  }
}

console.log(`\n✗ lint-wiki: 총 ${findings.length}건 위반 (${files.length}개 파일 검사)`)
process.exit(1)
