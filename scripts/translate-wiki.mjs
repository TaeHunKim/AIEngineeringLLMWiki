#!/usr/bin/env node
// Translates KO wiki pages (wiki/AI) into EN (wiki/en/AI) with a local LLM, section by section.
// Claude Code writes only the KO page; this script produces the EN twin deterministically:
//   npm run translate:wiki -- --changed          # every KO page changed/added vs HEAD
//   npm run translate:wiki -- wiki/AI/X.md ...   # specific KO pages
//   npm run translate:wiki -- --check            # only test that the local LLM is reachable
// Flags: --force (retranslate everything), --out <dir> (write under <dir> instead of wiki/en/AI)
//
// Config (.env or shell env; shell wins):  WIKI_LLM_URL, WIKI_LLM_MODEL
// Exit codes: 0 ok · 1 translation/validation failure · 3 local LLM unavailable
//   (3 means: fall back to writing the EN page by hand, then run `npm run lint:wiki`)
//
// Everything the model must not touch (wikilinks, code, URLs, footnotes, comments) is swapped for
// ⟦n⟧ placeholders before the request and restored after; output is validated structurally and any
// block that fails twice aborts that file. Sections whose KO text is unchanged keep their existing EN.
import { existsSync, readFileSync } from "fs"
import { mkdir, readFile, writeFile } from "fs/promises"
import { execFileSync, spawnSync } from "child_process"
import { dirname, join, relative } from "path"

const KO_ROOT = "wiki/AI"
const EN_ROOT = "wiki/en/AI"
const META_FILES = new Set(["log.md", "SCHEMA.md"])
const HANGUL = /[가-힣]/
const CHUNK_CHARS = 1500

const toPosix = (p) => p.split("\\").join("/")

// ---------- config ----------
function loadEnvFile() {
  if (!existsSync(".env")) return
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!m || line.trimStart().startsWith("#")) continue
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2")
  }
}
loadEnvFile()
const LLM_URL = process.env.WIKI_LLM_URL
const LLM_MODEL = process.env.WIKI_LLM_MODEL

// ---------- args ----------
const argv = process.argv.slice(2)
const flag = (name) => argv.includes(name)
const outIdx = argv.indexOf("--out")
const OUT_DIR = outIdx >= 0 ? argv[outIdx + 1] : null
const positional = argv.filter((a, i) => !a.startsWith("--") && !(outIdx >= 0 && i === outIdx + 1))

class Unavailable extends Error {}
class TranslationFailure extends Error {}

// ---------- LLM ----------
async function healthCheck() {
  if (!LLM_URL || !LLM_MODEL) {
    throw new Unavailable("WIKI_LLM_URL / WIKI_LLM_MODEL 이 설정되지 않았습니다 (.env.example 참고)")
  }
  const modelsUrl = LLM_URL.replace(/\/chat\/completions\/?$/, "/models")
  let res
  try {
    res = await fetch(modelsUrl, { signal: AbortSignal.timeout(5000) })
  } catch (e) {
    throw new Unavailable(`로컬 LLM에 연결할 수 없습니다 (${modelsUrl}): ${e.message}`)
  }
  if (!res.ok) throw new Unavailable(`로컬 LLM 응답 오류: HTTP ${res.status}`)
  const ids = ((await res.json()).data ?? []).map((m) => m.id)
  if (!ids.includes(LLM_MODEL)) {
    throw new Unavailable(`모델 ${LLM_MODEL} 이(가) 서버에 없습니다. 사용 가능: ${ids.join(", ")}`)
  }
}

async function chat(system, user, temperature = 0) {
  let res
  try {
    res = await fetch(LLM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(300_000),
    })
  } catch (e) {
    throw new Unavailable(`번역 요청 실패: ${e.message}`)
  }
  if (!res.ok) throw new Unavailable(`번역 요청 오류: HTTP ${res.status}`)
  return (await res.json()).choices[0].message.content
}

const SYSTEM_PROSE = `You translate Korean technical wiki markdown into English.
Rules:
- Output ONLY the translation. No commentary, no code fences around the output.
- Tokens like ⟦0⟧ ⟦1⟧ are placeholders. Copy each one exactly once, in the same relative position. Never translate, reorder, or delete them.
- Keep the markdown structure line for line: same number of lines, same heading levels (#), list markers, numbering, blockquote markers, and table pipes (|) per row. Do not merge or split lines.
- Keep CS/AI terms, product names, and proper nouns in their standard English form.
- Use plain Unicode for symbols. Keep → · × ≈ as they are. Never use LaTeX ($...$).
- Write natural, concise technical English.`

const SYSTEM_CODE_LINE = `The input is ONE line from a code/diagram block. It contains Korean text (a comment, label, or string).
Translate ONLY the Korean text into English. Leave every other character, symbol, and space exactly as it is.
Output ONLY that single line: no fences, no commentary, no line breaks.`

const SYSTEM_LABEL = `Translate this Korean label into English. Keep CS/AI terms in standard English.
Output ONLY the translated text, nothing else.`

// ---------- masking ----------
function mask(text) {
  const slots = []
  const hold = (s) => {
    slots.push(s)
    return `⟦${slots.length - 1}⟧`
  }
  let out = text
  out = out.replace(/<!--[\s\S]*?-->/g, hold)
  out = out.replace(/\[\[([^\]]+?)\]\]/g, (m, inner) => hold(`[[${inner}]]`)) // alias handled at restore
  out = out.replace(/`[^`\n]+`/g, hold)
  out = out.replace(/\]\(([^)\s]+)\)/g, (m, url) => `](${hold(url)})`)
  out = out.replace(/https?:\/\/[^\s)>\]⟦]+/g, hold)
  out = out.replace(/\[\d+(?:[,\s-]+\d+)*\]/g, hold)
  return { text: out, slots }
}

async function restoreSlot(slot, aliasCache) {
  if (!slot.startsWith("[[")) return slot
  const inner = slot.slice(2, -2)
  const m = inner.match(/^(.*?)(\\?\|)(.*)$/s)
  let target = m ? m[1] : inner
  let sep = m ? m[2] : ""
  let alias = m ? m[3] : ""
  target = target.replace(/^AI\//, "en/AI/")
  if (alias && HANGUL.test(alias)) {
    // Prefer the target page's own EN title so the same page reads the same everywhere.
    const enFile = `wiki/${target.split("#")[0]}.md`
    const title = existsSync(enFile) ? readFileSync(enFile, "utf8").match(/^# (.+)$/m)?.[1] : null
    if (title && !HANGUL.test(title)) alias = title.trim()
  }
  if (alias && HANGUL.test(alias)) {
    if (!aliasCache.has(alias)) {
      aliasCache.set(alias, (await chat(SYSTEM_LABEL, alias)).trim().replace(/^["']|["']$/g, ""))
    }
    alias = aliasCache.get(alias)
  }
  return `[[${target}${sep}${alias}]]`
}

const LATEX = [
  [/\$\\rightarrow\$|\$\\to\$/g, "→"],
  [/\$\\cdot\$/g, "·"],
  [/\$\\times\$/g, "×"],
  [/\$\\approx\$/g, "≈"],
  [/\$\\leftarrow\$/g, "←"],
  [/\$\\leftrightarrow\$/g, "↔"],
]

function lineSignature(l) {
  const lead = l.match(/^\s*(#{1,6} |[-*+] |\d+\. |> |\|)?/)[0]
  return `${lead}|${(l.match(/(?<!\\)\|/g) ?? []).length}`
}

function validate(masked, out, slots) {
  for (let i = 0; i < slots.length; i++) {
    const n = out.split(`⟦${i}⟧`).length - 1
    if (n !== 1) return `placeholder ⟦${i}⟧ 가 ${n}번 나타남`
  }
  if (/⟦\d+⟧/.test(out.replace(/⟦(\d+)⟧/g, (m, d) => (+d < slots.length ? "" : m)))) {
    return "알 수 없는 placeholder 가 있음"
  }
  const a = masked.split("\n")
  const b = out.split("\n")
  if (a.length !== b.length) return `줄 수가 다름 (${a.length} → ${b.length})`
  for (let i = 0; i < a.length; i++) {
    if (lineSignature(a[i]) !== lineSignature(b[i])) {
      return `${i + 1}번째 줄의 구조(heading/목록/표 pipe)가 다름: "${b[i].slice(0, 60)}"`
    }
  }
  if (HANGUL.test(out)) return "한글이 남아 있음"
  return null
}

function cleanOutput(out, input) {
  let s = out.trim()
  for (const [re, rep] of LATEX) s = s.replace(re, rep)
  const wrapped = s.match(/^```[a-z]*\n([\s\S]*)\n```$/)
  if (wrapped && !input.trimStart().startsWith("```")) s = wrapped[1].trim()
  return s
}

async function translateChunk(chunk, aliasCache) {
  const lead = chunk.match(/^\n*/)[0]
  const trail = chunk.match(/\n*$/)[0]
  const core = chunk.slice(lead.length, chunk.length - trail.length)
  if (!core || !HANGUL.test(core)) return chunk
  const { text, slots } = mask(core)
  if (!HANGUL.test(text)) return chunk.replace(/\[\[AI\//g, "[[en/AI/")
  let lastErr = ""
  for (const temp of [0, 0.3]) {
    const raw = await chat(SYSTEM_PROSE, text, temp)
    const out = cleanOutput(raw, text)
    const err = validate(text, out, slots)
    if (err) {
      lastErr = err
      continue
    }
    const restored = await Promise.all(slots.map((s) => restoreSlot(s, aliasCache)))
    return lead + out.replace(/⟦(\d+)⟧/g, (m, d) => restored[+d]) + trail
  }
  throw new TranslationFailure(`${lastErr}\n    원문: ${core.slice(0, 80).replace(/\n/g, "⏎")}…`)
}

// Code/diagram blocks are translated one line at a time: models tend to merge or reflow lines when
// handed a whole block, which breaks alignment and mermaid syntax.
async function translateFence(block, warnings, where) {
  if (!HANGUL.test(block)) return block
  const lines = block.split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (!HANGUL.test(lines[i])) continue
    const indent = lines[i].match(/^\s*/)[0]
    const body = lines[i].slice(indent.length)
    let done = null
    for (const temp of [0, 0.3]) {
      const out = cleanOutputCode(await chat(SYSTEM_CODE_LINE, body, temp)).replace(/^```[a-z]*\n?|\n?```$/g, "")
      if (!out.includes("\n") && !HANGUL.test(out) && out.trim()) {
        done = out
        break
      }
    }
    if (done === null) {
      warnings.push(`${where}: 코드 블록 ${i + 1}번째 줄의 한글을 번역하지 못해 원본을 유지했습니다`)
      continue
    }
    lines[i] = indent + done
  }
  return lines.join("\n")
}

function cleanOutputCode(out) {
  let s = out.trim()
  for (const [re, rep] of LATEX) s = s.replace(re, rep)
  return s
}

// ---------- document structure ----------
function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/)
  return m ? { fm: m[0], body: raw.slice(m[0].length) } : { fm: "", body: raw }
}

// Sections start at each heading outside a code fence; index 0 is the pre-heading preamble.
function splitSections(body) {
  const sections = [{ heading: "(본문 시작)", lines: [] }]
  let fenced = false
  for (const line of body.split("\n")) {
    if (line.trimStart().startsWith("```")) fenced = !fenced
    else if (!fenced && /^#{1,6} /.test(line)) {
      sections.push({ heading: line.replace(/^#+\s*/, ""), lines: [line] })
      continue
    }
    sections[sections.length - 1].lines.push(line)
  }
  return sections.map((s) => ({ heading: s.heading, text: s.lines.join("\n") }))
}

function splitSegments(text) {
  const segments = []
  let cur = []
  let fence = null
  for (const line of text.split("\n")) {
    const isFence = line.trimStart().startsWith("```")
    if (!fence && isFence) {
      if (cur.length) segments.push({ type: "text", text: cur.join("\n") })
      cur = [line]
      fence = true
    } else if (fence && isFence) {
      cur.push(line)
      segments.push({ type: "fence", text: cur.join("\n") })
      cur = []
      fence = null
    } else cur.push(line)
  }
  if (cur.length) segments.push({ type: fence ? "fence" : "text", text: cur.join("\n") })
  return segments
}

function chunkLines(text) {
  const chunks = []
  let cur = []
  let len = 0
  for (const line of text.split("\n")) {
    if (cur.length && len + line.length > CHUNK_CHARS && line.trim() === "") {
      chunks.push(cur.join("\n"))
      cur = []
      len = 0
    }
    cur.push(line)
    len += line.length + 1
  }
  if (cur.length) chunks.push(cur.join("\n"))
  return chunks
}

async function translateSection(text, warnings, where, aliasCache) {
  const parts = []
  for (const seg of splitSegments(text)) {
    if (seg.type === "fence") parts.push(await translateFence(seg.text, warnings, where))
    else {
      const chunks = chunkLines(seg.text)
      const done = []
      for (const c of chunks) done.push(await translateChunk(c, aliasCache))
      parts.push(done.join("\n"))
    }
  }
  return parts.join("\n")
}

async function translateFrontmatter(fm, aliasCache) {
  const lines = fm.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([\w-]+:\s*)(.*)$/)
    if (m && HANGUL.test(m[2])) {
      const t = (await chat(SYSTEM_LABEL, m[2])).trim()
      lines[i] = m[1] + (/^["']/.test(m[2]) ? `"${t.replace(/^["']|["']$/g, "")}"` : t)
    }
  }
  return lines.join("\n")
}

// Longest-common-subsequence alignment of exact-equal sections: map[newIdx] = oldIdx | -1
function align(oldS, newS) {
  const n = oldS.length
  const m = newS.length
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = oldS[i].text === newS[j].text ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const map = new Array(m).fill(-1)
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (oldS[i].text === newS[j].text) map[j++] = i++
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return map
}

// ---------- per-file ----------
function gitShow(path) {
  try {
    return execFileSync("git", ["show", `HEAD:${path}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
  } catch {
    return null
  }
}

async function translateFile(koPath, report) {
  const rel = toPosix(relative(KO_ROOT, koPath))
  const enPath = join(EN_ROOT, rel)
  const target = OUT_DIR ? join(OUT_DIR, rel) : enPath
  const koNew = await readFile(koPath, "utf8")
  const koOldRaw = gitShow(toPosix(koPath))
  const enOldRaw = existsSync(enPath) ? await readFile(enPath, "utf8") : null

  const nw = splitFrontmatter(koNew)
  const newSecs = splitSections(nw.body)
  let reuse = new Array(newSecs.length).fill(null)
  let enFm = null

  if (!flag("--force") && koOldRaw !== null && enOldRaw !== null) {
    const old = splitFrontmatter(koOldRaw)
    const oldSecs = splitSections(old.body)
    const enSecs = splitSections(splitFrontmatter(enOldRaw).body)
    if (oldSecs.length === enSecs.length) {
      const map = align(oldSecs, newSecs)
      reuse = map.map((o) => (o >= 0 ? enSecs[o].text : null))
      if (old.fm === nw.fm) enFm = splitFrontmatter(enOldRaw).fm
    }
  }

  const warnings = []
  const aliasCache = new Map()
  const translated = []
  const secs = []
  for (let i = 0; i < newSecs.length; i++) {
    if (reuse[i] !== null) {
      secs.push(reuse[i])
      continue
    }
    const where = `${rel} › ${newSecs[i].heading}`
    process.stdout.write(`  번역: ${where}\n`)
    try {
      secs.push(await translateSection(newSecs[i].text, warnings, where, aliasCache))
    } catch (e) {
      if (e instanceof TranslationFailure) throw new TranslationFailure(`${where}\n    ${e.message}`)
      throw e
    }
    translated.push(where)
  }
  if (enFm === null) enFm = nw.fm ? await translateFrontmatter(nw.fm, aliasCache) : ""

  const out = enFm + secs.join("\n")
  if (out === enOldRaw && !OUT_DIR) {
    console.log(`= ${rel}: 변경 없음`)
    return
  }
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, out)
  console.log(`✓ ${rel}: ${translated.length}개 섹션 번역 → ${toPosix(target)}`)
  report.translated.push(...translated)
  report.warnings.push(...warnings)
}

// ---------- main ----------
function changedKoFiles() {
  const run = (args) => execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean)
  const names = new Set([
    ...run(["diff", "--name-only", "HEAD", "--", KO_ROOT]),
    ...run(["ls-files", "-o", "--exclude-standard", "--", KO_ROOT]),
  ])
  return [...names].filter((f) => f.endsWith(".md") && existsSync(f))
}

const isMeta = (f) => META_FILES.has(f.split("/").pop()) && toPosix(f) === `${KO_ROOT}/${f.split("/").pop()}`

async function main() {
  try {
    await healthCheck()
  } catch (e) {
    if (e instanceof Unavailable) {
      console.error(`✗ translate-wiki: ${e.message}\n  → 로컬 LLM을 쓸 수 없습니다. EN 문서를 직접 작성한 뒤 npm run lint:wiki 를 실행하세요.`)
      process.exit(3)
    }
    throw e
  }
  if (flag("--check")) {
    console.log(`✓ translate-wiki: ${LLM_MODEL} 사용 가능`)
    return
  }

  const files = (flag("--changed") ? changedKoFiles() : positional.map(toPosix))
    .filter((f) => toPosix(f).startsWith(KO_ROOT + "/") && !isMeta(toPosix(f)))
  if (files.length === 0) {
    console.log("번역할 KO 문서가 없습니다. (--changed 또는 파일 경로를 지정하세요)")
    return
  }

  const report = { translated: [], warnings: [] }
  let failed = 0
  for (const f of files) {
    console.log(`\n${f}`)
    try {
      await translateFile(f, report)
    } catch (e) {
      if (e instanceof Unavailable) {
        console.error(`✗ translate-wiki: ${e.message}\n  → 이 파일부터는 EN을 직접 작성하세요.`)
        process.exit(3)
      }
      if (e instanceof TranslationFailure) {
        failed++
        console.error(`✗ ${f}: 번역 검증 실패 — EN 파일을 쓰지 않았습니다\n  ${e.message}`)
      } else throw e
    }
  }

  if (report.warnings.length) console.log(`\n경고:\n${report.warnings.map((w) => `  - ${w}`).join("\n")}`)
  if (report.translated.length) {
    console.log(`\nClaude 리뷰 대상 (git diff wiki/en 에서 의미·용어 확인):\n${report.translated.map((s) => `  - ${s}`).join("\n")}`)
  }
  if (failed) {
    console.error(`\n✗ translate-wiki: ${failed}개 파일 실패 (위 블록은 EN을 직접 작성/수정하세요)`)
    process.exit(1)
  }
  if (!OUT_DIR) {
    const lint = spawnSync("node", ["scripts/lint-wiki.mjs"], { stdio: "inherit" })
    if (lint.status !== 0) process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
