---
title: What's New
order: 1
noGraph: true
---

# What's New

이 위키에 새로 추가되거나 보강된 주요 문서 내역을 최신순으로 요약합니다.

---

## 2026-11-15

### 신규 추가 문서 (New Pages)

- **[[AI/Engineering/Prompt_Engineering/Test_Time_Compute_Scaling|Test-Time Compute Scaling]]** (`Prompt Engineering`): 추론 시점 연산 확장 패러다임 — Parallel Sampling(Best-of-$N$, Majority Voting), Sequential Revision(Iterative Self-Refinement, Budget Forcing `s1`), Tree Search(MCTS, Beam Search)와 Outcome/Process Reward Model(ORM vs PRM), Compute-Optimal Scaling 배분 전략을 정리.
- **[[AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Merging|Model Merging]]** (`Model Engineering / Training & Tuning`): 추가 GPU 학습 없이 복수의 파인튜닝 모델을 가중치 공간에서 결합하는 기법 — Linear/Task Arithmetic, SLERP, TIES-Merging, DARE, Frankenmerging(레이어 스태킹) 및 `mergekit` 실무 설정과 Evolutionary Model Merging을 정리.
- **[[AI/Engineering/Loop_Engineering/Serving_Engineering/Constrained_Decoding|Constrained Decoding (Grammar-Guided Generation)]]** (`Loop Engineering / Serving Engineering`): 토큰 샘플링 단계에서 정규식·JSON Schema·CFG를 강제하는 서빙 엔진 내부 메커니즘 — FSM 기반 토큰 마스크 프리컴파일(Outlines), Pushdown Automaton + 비트마스크(XGrammar, llguidance), Jump-Forward Decoding(Compressed FSM)을 통한 TTFT·TPOT 가속 원리를 정리.

### 주요 보강 문서 (Major Content Updates)

- **[[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Quantization|Quantization]]**: Hopper/Blackwell 하드웨어 네이티브 양자화(**FP8 E4M3/E5M2**, **NVFP4 / MXFP4**), 장문 컨텍스트 서빙을 위한 **FP8 KV Cache 양자화**, **BitNet b1.58** 3진 양자화 학습(QAT)을 추가하고 `GPTQConfig` 최신 인터페이스로 예제를 갱신.
- **[[AI/Engineering/Model_Engineering/Training_and_Tuning/PEFT_LoRA_QLoRA|PEFT — LoRA & QLoRA]]**: **DoRA**(Weight-Decomposed LoRA), **rsLoRA**, **GaLore** 등 최신 LoRA 계보 확장과 단일 베이스 모델 위에서 수백 개 어댑터를 동시 서빙하는 **Multi-LoRA 서빙(S-LoRA, Punica, vLLM)** 섹션을 추가.
- **[[AI/Engineering/Model_Engineering/Training_and_Tuning/Model_Distillation|Model Distillation]]**: 상용 모델 약관(ToS) 제약과 오픈웨이트 Teacher(DeepSeek-R1, Qwen, Llama) 활용 표준, 노출 편향을 완화하는 **On-Policy Distillation(GKD)**, 긴 시스템 프롬프트를 가중치로 내재화하는 **Context / Prompt Distillation**을 보강.
- **[[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Model_Architectures_and_MoE|Model Architectures & MoE]]**: 긴 에이전트 세션의 KV Cache 병목을 줄이기 위해 Mamba-2(SSD)·Linear Attention과 Full Attention을 교차 배치하는 **Hybrid SSM / Linear Attention 아키텍처**(Jamba, Nemotron-H, Qwen3-Next)를 추가.
- **[[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Chunking_Strategies|Chunking Strategies]]**: 장문 임베딩 모델로 문서 전체를 먼저 인코딩한 뒤 청크별 풀링을 수행하는 **Late Chunking** 아키텍처와 Contextual Retrieval 대비 트레이드오프 비교표를 추가.
- **[[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Vector_Storage|Vector Storage]]**: NVMe SSD 기반 대규모 그래프 인덱스인 **DiskANN / Vamana**와 프로덕션 메모리 절감을 위한 **벡터 양자화(SQ8, PQ, Binary Quantization + Rescoring)** 및 오브젝트 스토리지 네이티브 벡터 DB 지형을 추가.
- **[[AI/Engineering/Context_Engineering/Retrieval_Strategies/NL2SQL/NL2SQL|NL2SQL]]** & **[[AI/Engineering/Context_Engineering/Retrieval_Strategies/SQL_RAG/SQL_RAG|SQL RAG]]**: 엔터프라이즈 환경에서 조인 오류와 지표 불일치를 방지하는 **Semantic Layer / Text-to-Metric 연동**(dbt Semantic Layer, MetricFlow, Cube, LookML)을 추가하고 두 문서 간 역할 경계 및 공식 레퍼런스를 정비.
- **[[AI/Engineering/Harness_Engineering/Harness_Evaluation/Observability_and_Tracing|Observability & Tracing]]**: 벤더 중립 계측을 위한 **OpenTelemetry GenAI Semantic Conventions(`gen_ai.*`)** 및 **OpenInference** 표준 스펙을 추가.
- **[[AI/Engineering/Agent_Engineering/Agent_Applications/Computer_Use_and_Voice_Agents|Computer Use & Voice Agents]]**: 음성 에이전트의 **Cascaded 파이프라인(ASR → LLM → TTS)** 과 **Native Speech-to-Speech(S2S)** 아키텍처 간 지연시간·운율·도구 호출·감사(Audit) 트레이드오프 비교를 추가.

### 코드·구조 현대화 (Modernization & Cleanup)

- **[[AI/Engineering/Context_Engineering/Semantic_Cache|Semantic Cache]]**: 오탐(False Positive)·교차 테넌트 캐시 격리·TTL 무효화 등 실무 주의사항 표를 추가하고 Redis 코사인 유사도 캐시 구현 및 최신 OpenAI SDK v1 호출로 예제를 정비.
- **[[AI/Engineering/Context_Engineering/Context_Compression|Context Compression]]**, **[[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/HyDE|HyDE]]**, **[[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Advanced_Retrieval|Advanced Retrieval]]**: 구형 LangChain 체인/메모리(`LLMChainExtractor`, `ConversationSummaryMemory`, `HypotheticalDocumentEmbedder`, `llm.generate()`) 코드를 `langchain_core`·`langchain_openai`(`trim_messages`, `llm.invoke()`) 기반 최신 패턴으로 교체.
- **인덱스 및 허브 정비**: [[AI/Engineering/Prompt_Engineering/Prompt_Engineering|Prompt Engineering]], [[AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training & Tuning]], [[AI/Engineering/Loop_Engineering/Serving_Engineering/Serving_Engineering|Serving Engineering]], [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]], [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/Document_Ingestion|Document Ingestion]], [[AI/Engineering/Model_Engineering/Model_Types/Large_Language_Models|Large Language Models]], [[AI/Engineering/Prompt_Engineering/Chain_of_Thought|Chain of Thought]], [[AI/Engineering/Prompt_Engineering/Structured_Output|Structured Output]], [[AI/Engineering/Loop_Engineering/Production_Operations|Production Operations]], [[AI/Engineering/Agent_Engineering/Agent_Infrastructure/AgentOps|AgentOps]] 문서의 색인·역링크를 동기화.
