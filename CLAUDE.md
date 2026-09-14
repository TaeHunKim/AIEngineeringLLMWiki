# Claude Code Instructions

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## LLM Wiki Generation Instruction
* Refer llm_wiki.md file for details. Detailed maintenance doctrine lives in `wiki/AI/SCHEMA.md`.
* Generate wiki documents in Korean, but keep CS/AI relevant terms as-is instead of translating them
* When adding or updating wiki content, always create/update both the Korean version (`wiki/AI/...`) AND the English version (`wiki/en/AI/...`)
  * Korean: prose in Korean, CS/AI terms in English
  * English: full English translation, same structure and frontmatter `order:` values
  * English wikilinks use the `en/` prefix — `[[en/AI/Engineering/path/to/File|Display Name]]`.
    An EN page linking to `[[AI/...]]` (no `en/`) points into the Korean tree and orphans the target.

### Wikilinks inside markdown tables — escape the pipe

Inside a table cell the alias pipe **must** be escaped as `\|`. An unescaped `|` ends the
cell and truncates the link, so it is not even recognized as a link. This has regressed twice.

```markdown
Outside a table:  [[AI/Engineering/Harness_Engineering/Red_Teaming|Red_Teaming]]
Inside a table:   | [[AI/Engineering/Harness_Engineering/Red_Teaming\|Red_Teaming]] | ... |
```

Likewise, never put a wikilink inside a fenced code block — it renders as raw `[[path|alias]]`
text. In ASCII diagrams and checklists write the plain document name, and put the real link in
prose outside the block or in `## 관련 개념`.

### Prose style — describe the subject, not the wiki's own history

Never write about what the wiki used to lack or how it was edited. A reader starting from
page one neither knows nor cares. That content belongs in `wiki/AI/log.md`.

```
❌ "이 위키에는 X를 다루는 문서가 없었다. 본 문서가 그 공백을 채운다."
❌ "이 챕터의 앞선 6개 문서는 …", "418줄로 커져서 분리했다", "A.md가 스스로 정의했듯"
✅ Open with what the subject is and why it matters, then position by topic:
   "[[A]]가 X를 다룬다면, 이 문서는 Y를 다룬다."
```
Allowed: pointing at one specific sibling page (`이 위키의 [[X]] 문서가 …`) and source
attribution (`이 위키의 기존 소스`). `log.md`/`SCHEMA.md` are exempt — meta is their purpose.

### Before committing wiki changes

Run `npm run lint:wiki`. It enforces all of the above (table pipes, dead links, KO/EN file-set
and `order:` parity, `en/` prefix, prose style) and exits non-zero on violations.
Do not hand-roll a link checker — normalizing `\|` to `|` before splitting makes escaped and
unescaped links look identical and silently reports broken links as fine.


