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
      // Engineering 최상위 챕터 순서 (Engineering/index.md 기준)
      Engineering: 0,
      Model_Engineering: 1,
      Prompt_Engineering: 2,
      Context_Engineering: 3,
      Flow_Engineering: 4,
      Agent_Engineering: 5,
      Harness_Engineering: 6,
      Loop_Engineering: 7,
      sources: 8,
      // Flow_Engineering 하위 (Flow_Engineering.md order:0 이후에 등장)
      Linear_Flow: 1,
      Graph_Flow: 2,
      // Context_Engineering 하위 (파일 order:0~5 이후에 등장)
      Retrieval_Strategies: 6,
      // Retrieval_Strategies 하위
      RAG: 1,
      GraphRAG: 2,
      NL2SQL: 3,
      SQL_RAG: 4,
      // GraphRAG 하위
      Knowledge_Graph: 1,
      // Agent_Engineering 하위 (Agent_Memory order:5 이후, Agent_Frameworks order:7 이전)
      Agent_Skills_and_Protocols: 6,
    }

    const getOrder = (node: any): number => {
      if (node.isFolder) {
        const o = FOLDER_ORDER[node.slugSegment]
        return o !== undefined ? o : 99
      }
      return typeof node.data?.order === "number" ? (node.data.order as number) : 99
    }

    const ao = getOrder(a)
    const bo = getOrder(b)
    if (ao !== bo) return ao - bo

    // 같은 order라면 폴더 → 파일 순, 그 다음 알파벳
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
    return (a.displayName ?? "").localeCompare(b.displayName ?? "")
  },
})

const config = await loadQuartzConfig()
export default config

export const layout = await loadQuartzLayout()
