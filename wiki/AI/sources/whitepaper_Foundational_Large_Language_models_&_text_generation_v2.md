# Whitepaper: Foundational Large Language Models & Text Generation

## 메타데이터
- **파일명**: `whitepaper_Foundational Large Language models & text generation_v2.pdf`
- **저자**: Mohammadamin Barektain, Anant Nawalgaria, Daniel J. Mankowitz, Majd Al Merey, Yaniv Leviathan, Massimo Mascaro, Matan Kalman, Elena Buchatskaya, Aliaksei Severyn, Irina Sigler, Antonio Gulli (Google)
- **발행 시점**: 2025년 2월
- **주제**: Transformer 아키텍처에서 시작해 GPT/BERT/Gemini/LLaMA/Mixtral/o1/DeepSeek-R1까지 — 모델 학습, Fine-Tuning(SFT/RLHF/PEFT/LoRA), 추론 가속, 프롬프팅·샘플링, 평가
- **출처 (URL)**: https://www.kaggle.com/whitepaper-foundational-llm-and-text-generation

## 요약
[[AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]]은 prefix가 주어졌을 때 다음 토큰의 확률을 매기는 모델. 이전엔 RNN(LSTM/GRU)이 표준이었지만 sequential·vanishing gradient 문제로 한계가 있었고, **Transformer (Vaswani 2017)**가 self-attention과 병렬화로 이를 깨뜨렸다. 본 백서는 [[AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]]가 어떻게 [[AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]]을 수행하는지, 그리고 SFT·RLHF·PEFT·LoRA 같은 [[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] 기법과 추론 가속 기술까지 망라한다.

## Transformer 아키텍처
- Encoder + Decoder. Self-attention으로 병렬화. Output size는 입력에 선형.
- **입력 파이프라인**: Normalization → Tokenization (subword) → Embedding (lookup) → Positional Encoding (덧셈)

### Self-Attention 수식
각 토큰별 Q = X·W_q, K = X·W_k, V = X·W_v. **Attention = softmax(QKᵀ / √d_k) · V**. √d_k 스케일링이 gradient 안정화. 예: "The tiger jumped out of a tree to get a drink because it was thirsty"에서 self-attention이 "the tiger"와 "it"을 연결.

### Multi-Head Attention
독립 Q/K/V projection을 가진 여러 head 병렬 → concat → linear projection. 장기 의존성 처리 향상.

### Add & Norm + Feedforward
각 블록에 residual + layer norm, attention sublayer + position-wise FFN(두 linear + ReLU/GELU).

### 변형
- **Encoder**: 입력 → contextual embedding (BERT)
- **Decoder**: 마스킹된 self-attention (autoregressive) + encoder-decoder cross-attention
- **Decoder-only**: 현대 LLM의 지배적 형태 (GPT/LLaMA/Gemini)
- **Encoder-only** (BERT): 생성 불가

### Mixture of Experts (MoE)
다수 expert + gating network. **희소 활성화** — 토큰당 일부 expert만. GLaM, Mixtral, Gemini 1.5/2.0.

## Reasoning 기법
- **Chain-of-Thought (CoT)**: 중간 단계 생성
- **Tree-of-Thoughts (ToT)**: 탐색으로 다중 경로
- **Least-to-Most prompting**: 하위 문제부터 점층
- Instruction tuning, RLHF, knowledge distillation, beam search, temperature scaling, RAG ([[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]])

## 학습
- 토크나이저: **BPE** 또는 **Unigram** (HF, SentencePiece — Kudo & Richardson 2018)
- 손실: cross-entropy
- 목적:
  - Decoder-only: next-token (shift)
  - Encoder-only (BERT): MLM (`The [MASK] sat on the mat`)
  - Encoder-decoder: seq2seq
- Context length trade-off: 길수록 풍부하지만 compute/memory 증가

## 모델 진화 (구체적 모델들)
- **GPT-1** (OpenAI 2018, 117M, 1.25B tokens) — Decoder-only. BooksCorpus(5GB, 7000+권) 사전학습 + supervised FT. delimiter `$` 사용.
- **BERT** (Google 2018) — Encoder-only. MLM + NSP. 이해 태스크 강함, 생성 불가.
- **GPT-2** (2019, 1.5B, 10B tokens) — WebText(40GB, 45M Reddit pages, karma≥3). **Zero-shot task transfer** 시연. Performance scales log-linear.
- **GPT-3 / 3.5 / 4** — GPT-3 175B, 300B tokens. Few-shot/zero-shot. **InstructGPT** (Ouyang 2022): SFT + RLHF — 1.3B InstructGPT가 175B GPT-3을 인간 평가에서 능가. GPT-3.5 turbo: 16,385 컨텍스트. **GPT-4**: multimodal(이미지+텍스트→텍스트), 128K 컨텍스트.
- **LaMDA** (Google 2021, 137B) — open-ended dialogue 최적화.
- **Gopher** (DeepMind 2021, 280B, 300B tokens, 2.45B-doc 10TB MassiveText). cosine LR + 1500 warmup, gradient clip 1. SOTA 81% 태스크. abstract algebra/reasoning 약점.
- **GLaM** (Google 2022, 1.2T) — 첫 sparsely-activated MoE LLM. GPT-3 대비 ⅓ 에너지, ½ FLOPs.
- **Chinchilla** (DeepMind 2022, 70B) — Kaplan scaling laws 갱신. **Kaplan**: N_opt ∝ C^0.73, D_opt ∝ C^0.27. **Chinchilla**: 100× compute → ~10× model + ~10× data 동등 스케일. 70B로 Gopher 280B / GPT-3 175B 능가.
- **PaLM** (Google, 540B) — Pathways, 두 TPU v4 Pod.
- **PaLM 2** (2023.05) — 더 작지만 더 강력. Google Cloud Generative AI 기반.
- **Gemini** (2023.12) — multimodal decoder-only with multi-query attention. Ultra/Pro/Nano/Flash. Ultra: 30/32 벤치 SOTA.
- **Gemini 1.5 Pro** (2024) — MoE. **컨텍스트 수백만 토큰**. 100% recall ~530K, >99.7% ~1M, 99.2% ~10M. 멀티스텝 태스크 66% 완료. 코드베이스 처리, 새 언어 학습, 영화 분석.
- **Gemini 2.0 Flash / 2.0 Pro / 2.0 Nano / 2.0 Flash Thinking** — 1M 입력/64K 출력, "thought processes" 노출.
- **Gemma 1/2/3** — 오픈 모델. Gemma 1: 256K vocab, 6T tokens. Gemma 2 27B ≈ LLaMA 3 70B. Gemma 3: multimodal, 128K, 140+ 언어.
- **LLaMA 1/2/3 (Meta)** — LLaMA 2: 7B/13B/70B, 4096 컨텍스트, **grouped-query attention**, 상업 라이선스. LLaMA 3.2: multilingual + vision, on-device 양자화.
- **Mixtral 8x7B (Mistral AI)** — SMoE, 47B 총/13B active, 32K 컨텍스트. LLaMA 2 70B 능가 (math/code/multilingual). Apache 2.0.
- **OpenAI o1 / o1-mini** — RL 학습 reasoning. Codeforces 89th percentile, AIME top 500, GPQA에서 PhD 능가.
- **DeepSeek-R1-Zero / R1** — pure-RL via **GRPO (Group Relative Policy Optimization)** — critic 없이 그룹 평균 대비 평가. R1 multi-stage: SFT cold start → GRPO RL → rejection sampling → SFT → 최종 RL. AIME 2024에서 o1 매치/능가.
- 기타: Qwen 1.5 (Alibaba 0.5B–72B), Yi (01.AI 6B/34B), Grok 3 (xAI, 1M 컨텍스트), GPT-NeoX, GPT-J, Alpaca, Vicuna, Falcon, PHI, NVLM, DBRX.

### Comparison Table (선별)
| Model | Params | Vocab | Embed | Heads | Layers | Context | Pretrain |
|---|---|---|---|---|---|---|---|
| Attention (2017) | 213M | 37K | 1024 | 16 | 6 | — | 160M |
| GPT (2018) | 117M | 40K | 768 | 12 | 12 | 512 | 1.25B |
| GPT-2 (2019) | 1.5B | 50K | 1600 | 25 | 48 | 1024 | 10B |
| GPT-3 (2020) | 175B | 50K | 12288 | 96 | 96 | 2048 | 300B |
| LaMDA (2021) | 137B | 32K | 8192 | 128 | 64 | — | 168B |
| Gopher (2021) | 280B | 32K | 16384 | 128 | 80 | 2048 | 300B |
| Chinchilla (2022) | 70B | 32K | 8192 | 64 | 80 | 2048 | 1.4T |

## Fine-Tuning
- **Pretraining**: 라벨 없음, 주~월, GPU/TPU 집약 → **Fine-tuning**: 훨씬 저렴, 라벨 데이터.
- **SFT 변형**: instruction/dialogue/safety tuning.
- **RLHF**: reward model(SFT 모델 초기화)을 인간 선호 쌍으로 학습 → 정책 그래디언트로 SFT 모델 fine-tune. Captures 안전성·도움됨·공정성·진실성.
- **RLAIF** (Constitutional AI, Bai 2022): AI 라벨러로 대체.
- **DPO** (Rafailov 2023): 명시적 RM 없이 직접 preference 최적화.

### PEFT
- **Adapter** (Houlsby 2019): 작은 모듈 삽입, 그것만 학습
- **LoRA** (Hu 2021): 가중치 업데이트를 low-rank 두 행렬로 근사. 원본 frozen. 모듈 swap 가능
- **QLoRA** (Dettmers 2023): quantized 가중치 위 LoRA
- **Soft prompting** (Lester 2021): 학습 가능한 연속 prompt 벡터 (5 토큰 가능)를 frozen LLM에 prepend
- 비용: full FT > LoRA > soft prompting (좋음) / 성능: full FT ≥ LoRA ≥ soft prompting

## 사용
### Prompt Engineering
Zero-shot, Few-shot (3–5 예제), CoT.

### Sampling / Decoding
- **Greedy** — argmax, 반복적
- **Random** — 확률 비례 샘플링, 창의적이나 nonsense 위험
- **Temperature** — logits / T. T>1 다양성↑, T<1 sharpening
- **Top-K** — 상위 K 토큰
- **Top-P (nucleus)** (Holtzman) — 누적 확률 ≥ P 가장 작은 집합. 모델 confidence에 적응
- **Best-of-N** — N개 생성 후 reward model로 선택
- 태스크별 튜닝: 사실 QA는 낮은 T, 창작은 높은 T

### 평가
3 pillar: (1) 프로덕션 트래픽 미러 평가셋, (2) E2E 평가 (RAG·agent 워크플로우 포함), (3) 비즈니스 결과 기반 rubric. 3 method: 정량 지표 / 인간 평가 / **LLM autorater** (인간 판단으로 calibration, position bias 주의 — Shi 2024).

## 추론 가속
### Trade-off
Quality vs Latency/Cost; Latency vs Cost(throughput).

### 출력 근사 (정확도 저하 가능)
- **Quantization** — FP32 → INT8/INT4. 메모리·통신·hw fast-path. **QAT** > post-hoc. 예: MobileNet SSD 2× 속도, 2% accuracy 손실 (Jacob 2017). per-channel/group granularity (Zhang 2023).
- **Distillation**:
  - Data distillation (Bucila 2006) — teacher가 합성 데이터 생성
  - Knowledge distillation (Hinton 2015) — student 출력 분포를 teacher와 정렬
  - On-policy distillation (Agarwal 2024) — student RL 시퀀스에 teacher 피드백

### 출력 보존 (정확도 동일)
- **FlashAttention** (Tri Dao 2022) — IO-aware attention, HBM↔SRAM/VMEM 데이터 이동 최소화. 2–4× 가속
- **Prefix Caching** — prefill phase의 KV cache를 prefix 공유 요청에 재사용. **Context Caching**으로 Google AI Studio·Vertex AI에 제공. prefix 변경 금물 (timestamp 등)
- **Speculative Decoding** (Leviathan 2022) — 작은 drafter가 후보 토큰 선행, 본 모델이 병렬 검증. 본 10ms + drafter 1ms로 3 토큰 30→13ms. 품질 중립

### Batching/Parallelism
Decode = memory-bound (배칭 적합), Prefill = compute-bound. Sequence/Pipeline/Tensor parallelism. 통신 비용이 주요 제약.

## 응용
- **Code/Math**: AlphaCode 2 (Gemini + 검색/툴, Codeforces top 15%), FunSearch (cap-set 문제, bin-packing), AlphaGeometry (neuro-symbolic, IMO geometry 25/30)
- 번역, 요약, QA, 챗봇, 콘텐츠 생성, NLI, 텍스트 분류, 텍스트 분석
- **Multimodal**: 이미지/비디오 스토리텔링, 맞춤 교육, 보조 기술, 의료 이미지+리포트, 신약 개발

## Key Takeaways
- Transformer는 토대, 파라미터 + 데이터 구성 모두 중요(Chinchilla scaling).
- Fine-tuning 순서: SFT → RLHF/RLAIF/DPO → PEFT (LoRA/soft prompting).
- 추론 가속은 출력 근사(quantization/distillation)와 출력 보존(FlashAttention/prefix caching/speculative decoding)으로 양분.
- 샘플링 파라미터(T·top-K·top-P)는 태스크에 따라 튜닝.

## 관련 개념
[[AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]]
