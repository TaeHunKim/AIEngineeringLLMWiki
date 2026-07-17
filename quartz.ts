import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"

// Explorer sortFn을 loadQuartzConfig() 호출 전에 등록해야 함
// (loadQuartzConfig 내부에서 loadQuartzLayout이 먼저 호출되어 Explorer 인스턴스가 생성되므로)
//
// sortFn 주의: Explorer 플러그인은 sortFn.toString()으로 직렬화해 브라우저에 전달함
// → 함수가 완전히 자기완결적이어야 함 (빌드 타임 클로저 변수 사용 불가)
// → FOLDER_ORDER를 함수 내부에 인라인으로 정의
// → 파일 순서는 frontmatter order 필드(data.order) 사용
componentRegistry.setOptionOverrides("explorer", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortFn: (a: any, b: any) => {
    const FOLDER_ORDER: Record<string, number> = {
      // Quartz가 slugSegment를 소문자로 변환하므로 키도 소문자 사용
      // Engineering 최상위 챕터 순서 (Engineering/index.md 기준)
      engineering: 0,
      model_engineering: 1,
      prompt_engineering: 2,
      context_engineering: 3,
      flow_engineering: 4,
      agent_engineering: 5,
      harness_engineering: 6,
      loop_engineering: 7,
      sources: 8,
      // Flow_Engineering 하위 (flow_engineering.md order:0 이후에 등장)
      linear_flow: 1,
      graph_flow: 2,
      // Context_Engineering 하위 (파일 order:0~5 이후에 등장)
      retrieval_strategies: 6,
      // Retrieval_Strategies 하위
      rag: 1,
      graphrag: 2,
      nl2sql: 3,
      sql_rag: 4,
      // GraphRAG 하위
      knowledge_graph: 1,
      // Agent_Engineering 하위 (agent_memory order:5 이후, agent_frameworks order:7 이전)
      agent_skills_and_protocols: 6,
    }

    // 내부 named 함수를 쓰면 esbuild가 __name() 헬퍼를 주입해 브라우저 eval에서 오류 발생
    // → 순서 계산 로직을 직접 인라인으로 작성
    const ao = a.isFolder
      ? (FOLDER_ORDER[a.slugSegment] !== undefined ? FOLDER_ORDER[a.slugSegment] : 99)
      : (typeof a.data?.order === "number" ? a.data.order : 99)
    const bo = b.isFolder
      ? (FOLDER_ORDER[b.slugSegment] !== undefined ? FOLDER_ORDER[b.slugSegment] : 99)
      : (typeof b.data?.order === "number" ? b.data.order : 99)
    if (ao !== bo) return ao - bo

    // 같은 order라면 폴더 → 파일 순, 그 다음 알파벳
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
    return (a.displayName ?? "").localeCompare(b.displayName ?? "")
  },
})

const config = await loadQuartzConfig()
export default config

export const layout = await loadQuartzLayout()
