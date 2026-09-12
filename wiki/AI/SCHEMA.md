# AI Wiki Schema & Guidelines

이 스키마는 AI Engineering 위키를 유지보수하는 LLM을 위한 규칙 및 워크플로우를 정의합니다.

## 디렉토리 구조
- `sources/`: 각 원본 문서(PDF, 블로그 포스트 등)별 요약, 핵심 내용, 메타데이터가 담긴 페이지. 원본 문서를 수정하지 않고 이곳에 요약본을 생성합니다.
- `Engineering/`: LLM 기반 AI 시스템을 설계·구축·운영하는 실무 지식 페이지. Model/Prompt/Context/Flow/Agent/Harness/Loop/Graph 8계층 구조로 구성됩니다.
- `index.md`: 전체 출처와 Engineering 문서에 대한 목록 및 한 줄 요약.
- `log.md`: 문서 인제스트 및 위키 업데이트에 대한 시간순 로그.

## 언어 및 표기 규칙 (매우 중요)
- **기본 언어**: 모든 본문은 **한국어**로 작성합니다.
- **전문 용어**: AI 관련 전문 용어(예: Prompt Engineering, RAG, Agents, MCP 등)는 한국어로 무리하게 번역하지 않고 **영어 원문 그대로** 사용합니다.
- **코드 스니펫**: 코드 스니펫 작성 시 코드 자체는 **영어**로 유지하고, **주석만 한국어**로 번역합니다.

## 이중 언어 미러 규칙 (매우 중요)

이 위키는 `wiki/AI/`(한국어)와 `wiki/en/AI/`(영어) 두 트리를 **1:1 미러**로 유지한다. 이 규칙은 `CLAUDE.md`에도 명시되어 있으며, 여기서는 위키 유지보수 관점에서 구체화한다.

- **동시 작성**: `Engineering/` 하위 문서를 신규 작성·수정할 때는 **반드시 KO(`wiki/AI/...`)와 EN(`wiki/en/AI/...`) 양쪽을 같은 세션에서 함께 갱신**한다. 한쪽만 갱신하고 넘어가지 않는다.
- **프론트매터 동일성**: `order:`(및 챕터 인덱스의 `nav_order:`) 값은 KO/EN 파일 간에 **반드시 동일**해야 한다. `quartz.ts`의 Explorer `sortFn`이 이 값으로 사이드바 순서를 계산하므로, 값이 어긋나면 두 언어의 사이드바 순서가 서로 달라진다.
- **EN wikilink 접두**: 영어 문서 안의 모든 wikilink는 `[[en/AI/Engineering/경로/파일|Display Name]]` 형태로 `en/` 접두사를 붙인다. `sources/` 인용도 동일하게 `[[en/AI/sources/문서명|표시명]]`로 링크한다 — EN 문서가 KO `sources/`를 가리키는 실수(고아 인용)를 만들지 않는다.
- **표 안 wikilink 이스케이프**: 마크다운 표 셀 안에 wikilink를 쓸 때는 파이프를 `\|`로 이스케이프한다(`[[경로\|표시명]]`) — 표 렌더링이 깨지는 것을 방지.
- **관련 개념·출처 동수 원칙**: `## 관련 개념`/`## Related Concepts`, `## 출처`/`## Sources` 섹션은 KO/EN 간 링크·인용 개수가 일치해야 한다. 번역 과정에서 누락되기 쉬우므로 Lint 시 우선 점검 대상이다.
- **신규 폴더 생성 시**: `Engineering/` 하위에 새 하위 폴더(예: `Cost_Engineering/`, `Serving_Engineering/`)를 만들 때는 `quartz.ts`의 `FOLDER_ORDER` 맵에도 해당 폴더의 `slugSegment`(소문자)를 등록해야 한다. 누락 시 사이드바에서 기본값(99)으로 폴백되어 챕터가 최하단으로 밀려난다.

## Ingest (문서 처리) 워크플로우
새로운 원본 문서가 추가되어 처리할 때 LLM은 다음 단계를 따릅니다.
1. 문서를 읽고 핵심 Engineering 개념, 패턴, 기법 등을 추출합니다.
2. `sources/<document_name>.md` 파일을 생성하고 메타데이터, 요약, 핵심 내용을 작성합니다. 관련 Engineering 페이지에 대해 `[[Engineering/...]]` 형태의 링크를 추가합니다.
3. 문서에서 중요한 Engineering 내용이 발견되면:
   - 해당 페이지가 `Engineering/` 하위 적절한 계층에 없다면 새로 생성합니다.
   - 이미 있다면 내용을 보강하고, 새로운 원본 문서를 출처로 추가(Cross-reference)합니다.
4. `index.md`에 새로운 Source와 생성/업데이트된 Engineering 페이지 목록을 추가합니다.
5. `log.md` 파일 끝에 `## [YYYY-MM-DD] ingest | <Document Title>` 형식으로 기록을 남깁니다.
6. 위 1~5단계는 KO 기준 설명이다 — 각 단계에서 만들어지거나 바뀌는 모든 파일은 **EN 대응 파일도 같은 세션에서 동시에** 반영한다(`log.md`·`SCHEMA.md`는 KO 전용이라 예외).

## Lint (유지보수) 규칙
- 끊어진 링크(Orphan pages, Dead links)가 없는지 확인합니다.
- 상충되는 내용이 있을 경우, 출처를 명확히 하여 양쪽 입장을 모두 서술합니다.
- KO/EN 파일 목록이 정확히 대응하는지(`log.md`·`SCHEMA.md` 2개 KO 전용 파일 제외), `order:` 값이 양쪽에서 동일한지 주기적으로 점검합니다.
