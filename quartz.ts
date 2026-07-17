import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import type { FileTrieNode } from "./quartz/util/fileTrie"

const config = await loadQuartzConfig()
export default config

// ----------------------------------------------------------------
// Explorer 사이드바 정렬: index.md 파일 기준 순서 적용
// ----------------------------------------------------------------

const FOLDER_ORDER: Record<string, number> = {
  Engineering: 0,
  Model_Engineering: 1,
  Prompt_Engineering: 2,
  Context_Engineering: 3,
  Flow_Engineering: 4,
  Agent_Engineering: 6,
  Harness_Engineering: 7,
  Loop_Engineering: 8,
  sources: 9,
  // 하위 폴더
  Linear_Flow: 1,
  Graph_Flow: 2,
  RAG: 1,
  GraphRAG: 2,
  NL2SQL: 3,
  SQL_RAG: 4,
  Knowledge_Graph: 1,
  Agent_Skills_and_Protocols: 6,
}

const FILE_ORDER: Record<string, number> = {
  "AI/Engineering/Model_Engineering/Model_Engineering": 0,
  "AI/Engineering/Model_Engineering/Pre-training_and_Continual_Learning": 1,
  "AI/Engineering/Model_Engineering/Full_Fine-Tuning": 2,
  "AI/Engineering/Model_Engineering/PEFT_LoRA_QLoRA": 3,
  "AI/Engineering/Model_Engineering/Quantization": 4,
  "AI/Engineering/Model_Engineering/Model_Distillation": 5,
  "AI/Engineering/Prompt_Engineering/Prompt_Engineering": 0,
  "AI/Engineering/Prompt_Engineering/System_and_Role_Prompting": 1,
  "AI/Engineering/Prompt_Engineering/Few_shot_Prompting": 2,
  "AI/Engineering/Prompt_Engineering/Chain_of_Thought": 3,
  "AI/Engineering/Prompt_Engineering/Sampling_Controls": 4,
  "AI/Engineering/Prompt_Engineering/Structured_Output": 5,
  "AI/Engineering/Context_Engineering/Context_Engineering": 0,
  "AI/Engineering/Context_Engineering/Memory_and_Semantic_Cache": 1,
  "AI/Engineering/Context_Engineering/LLM_Memory": 2,
  "AI/Engineering/Context_Engineering/Semantic_Cache": 3,
  "AI/Engineering/Context_Engineering/Context_Compression": 4,
  "AI/Engineering/Context_Engineering/Lost_in_the_Middle": 5,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/Retrieval_Strategies": 0,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG": 0,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies": 1,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage": 2,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval": 3,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/HyDE": 4,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Agentic_RAG": 5,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Hybrid_RAG": 6,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Multimodal_RAG": 7,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/GraphRAG": 0,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Knowledge_Graph": 0,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/LPG_and_RDF": 1,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/GraphRAG/Knowledge_Graph/Ontology": 2,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL": 0,
  "AI/Engineering/Context_Engineering/Retrieval_Strategies/SQL_RAG/SQL_RAG": 0,
  "AI/Engineering/Flow_Engineering/Flow_Engineering": 0,
  "AI/Engineering/Flow_Engineering/Linear_Flow/Linear_Flow": 0,
  "AI/Engineering/Flow_Engineering/Linear_Flow/LangChain": 1,
  "AI/Engineering/Flow_Engineering/Linear_Flow/LlamaIndex": 2,
  "AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling": 3,
  "AI/Engineering/Flow_Engineering/Graph_Flow/Graph_Flow": 0,
  "AI/Engineering/Flow_Engineering/Graph_Flow/LangGraph": 1,
  "AI/Engineering/Flow_Engineering/Graph_Flow/Cyclic_Flows": 2,
  "AI/Engineering/Flow_Engineering/Graph_Flow/ReAct_Pattern": 3,
  "AI/Engineering/Flow_Engineering/Graph_Flow/Human_in_the_Loop": 4,
  "AI/Engineering/Agent_Engineering/Agent_Engineering": 0,
  "AI/Engineering/Agent_Engineering/Agent_Core_Pillars": 1,
  "AI/Engineering/Agent_Engineering/Agent_Architectures": 2,
  "AI/Engineering/Agent_Engineering/Anthropic_Workflow_Patterns": 3,
  "AI/Engineering/Agent_Engineering/Planning_and_Reflection": 4,
  "AI/Engineering/Agent_Engineering/Agent_Memory": 5,
  "AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols": 6,
  "AI/Engineering/Agent_Engineering/Agent_Frameworks": 7,
  "AI/Engineering/Agent_Engineering/Multi_Agent_Coordination": 8,
  "AI/Engineering/Agent_Engineering/Computer_Use_and_Voice_Agents": 9,
  "AI/Engineering/Agent_Engineering/Autonomous_Systems": 10,
  "AI/Engineering/Agent_Engineering/Eval_Driven_Development_and_Agent_Workbench": 11,
  "AI/Engineering/Agent_Engineering/AgentOps": 12,
  "AI/Engineering/Agent_Engineering/Agent_Deployment": 13,
  "AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP": 1,
  "AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/A2A": 2,
  "AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/AG_UI": 3,
  "AI/Engineering/Harness_Engineering/Harness_Engineering": 0,
  "AI/Engineering/Harness_Engineering/Guardrail_Engineering": 1,
  "AI/Engineering/Harness_Engineering/LLM_as_a_Judge": 2,
  "AI/Engineering/Harness_Engineering/Agent_as_a_Judge": 3,
  "AI/Engineering/Harness_Engineering/Benchmarking": 4,
  "AI/Engineering/Harness_Engineering/Human_Evaluation": 5,
  "AI/Engineering/Harness_Engineering/Observability_and_Tracing": 6,
  "AI/Engineering/Harness_Engineering/Red_Teaming": 7,
  "AI/Engineering/Harness_Engineering/Alignment_Research": 8,
  "AI/Engineering/Harness_Engineering/AI_Governance_and_Compliance": 9,
  "AI/Engineering/Loop_Engineering/Loop_Engineering": 0,
  "AI/Engineering/Loop_Engineering/Data_Flywheel": 1,
  "AI/Engineering/Loop_Engineering/Continuous_Optimization": 2,
  "AI/Engineering/Loop_Engineering/Runtime_Optimization": 3,
  "AI/Engineering/Loop_Engineering/Production_Operations": 4,
}

function explorerSort(a: FileTrieNode, b: FileTrieNode): number {
  if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1

  if (a.isFolder && b.isFolder) {
    const ao = FOLDER_ORDER[a.slugSegment] ?? 99
    const bo = FOLDER_ORDER[b.slugSegment] ?? 99
    if (ao !== bo) return ao - bo
    return a.displayName.localeCompare(b.displayName)
  }

  const aSlug = a.slug.replace(/\/index$/, "")
  const bSlug = b.slug.replace(/\/index$/, "")
  const ao = FILE_ORDER[aSlug] ?? 99
  const bo = FILE_ORDER[bSlug] ?? 99
  if (ao !== bo) return ao - bo
  return a.displayName.localeCompare(b.displayName)
}

// npx quartz plugin install --from-config 실행 후 Explorer 오버라이드 등록
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ExternalPlugin: any = await import("./.quartz/plugins")
  ExternalPlugin.Explorer({ sortFn: explorerSort })
} catch {
  // 플러그인 미설치 시 기본 알파벳 정렬 유지
}

export const layout = await loadQuartzLayout()
