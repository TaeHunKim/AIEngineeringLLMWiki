# AI Wiki Schema & Guidelines

이 스키마는 AI Engineering 위키를 유지보수하는 LLM을 위한 규칙 및 워크플로우를 정의합니다.

## 디렉토리 구조
- `sources/`: 각 원본 문서(PDF, 블로그 포스트 등)별 요약, 핵심 내용, 메타데이터가 담긴 페이지. 원본 문서를 수정하지 않고 이곳에 요약본을 생성합니다.
- `Engineering/`: LLM 기반 AI 시스템을 설계·구축·운영하는 실무 지식 페이지. Model/Prompt/Context/Flow/Agent/Harness/Loop 7계층 구조로 구성됩니다.
- `index.md`: 전체 출처와 Engineering 문서에 대한 목록 및 한 줄 요약.
- `log.md`: 문서 인제스트 및 위키 업데이트에 대한 시간순 로그.

## 언어 및 표기 규칙 (매우 중요)
- **기본 언어**: 모든 본문은 **한국어**로 작성합니다.
- **전문 용어**: AI 관련 전문 용어(예: Prompt Engineering, RAG, Agents, MCP 등)는 한국어로 무리하게 번역하지 않고 **영어 원문 그대로** 사용합니다.
- **코드 스니펫**: 코드 스니펫 작성 시 코드 자체는 **영어**로 유지하고, **주석만 한국어**로 번역합니다.

## Ingest (문서 처리) 워크플로우
새로운 원본 문서가 추가되어 처리할 때 LLM은 다음 단계를 따릅니다.
1. 문서를 읽고 핵심 Engineering 개념, 패턴, 기법 등을 추출합니다.
2. `sources/<document_name>.md` 파일을 생성하고 메타데이터, 요약, 핵심 내용을 작성합니다. 관련 Engineering 페이지에 대해 `[[Engineering/...]]` 형태의 링크를 추가합니다.
3. 문서에서 중요한 Engineering 내용이 발견되면:
   - 해당 페이지가 `Engineering/` 하위 적절한 계층에 없다면 새로 생성합니다.
   - 이미 있다면 내용을 보강하고, 새로운 원본 문서를 출처로 추가(Cross-reference)합니다.
4. `index.md`에 새로운 Source와 생성/업데이트된 Engineering 페이지 목록을 추가합니다.
5. `log.md` 파일 끝에 `## [YYYY-MM-DD] ingest | <Document Title>` 형식으로 기록을 남깁니다.

## Lint (유지보수) 규칙
- 끊어진 링크(Orphan pages, Dead links)가 없는지 확인합니다.
- 상충되는 내용이 있을 경우, 출처를 명확히 하여 양쪽 입장을 모두 서술합니다.
