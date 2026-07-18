# Whitepaper: Foundational Large Language Models & Text Generation

## Metadata
- **File Name**: `whitepaper_Foundational Large Language models & text generation_v2.pdf`
- **Authors**: Mohammadamin Barektain, Anant Nawalgaria, Daniel J. Mankowitz, Majd Al Merey, Yaniv Leviathan, Massimo Mascaro, Matan Kalman, Elena Buchatskaya, Aliaksei Severyn, Irina Sigler, Antonio Gulli (Google)
- **Publication Date**: February 2025
- **Subject**: From Transformer architecture to GPT/BERT/Gemini/LLaMA/Mixtral/o1/DeepSeek-R1 — model training, Fine-Tuning (SFT/RLHF/PEFT/LoRA), inference acceleration, prompting/sampling, evaluation
- **Source (URL)**: https://www.kaggle.com/whitepaper-foundational-llm-and-text-generation

## Summary
[[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] are models that score the probability of the next token given a prefix. Previously, RNN (LSTM/GRU) was the standard, but it had limitations due to sequential execution and vanishing gradient problems, which **Transformer (Vaswani 2017)** broke through using self-attention and parallelization. This whitepaper covers how [[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] perform [[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]], and encompasses [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] techniques such as SFT, RLHF, PEFT, and LoRA, as well as inference acceleration technologies.

## Transformer Architecture
- Encoder + Decoder. Parallelized with self-attention. Output size is linear to the input.
- **Input Pipeline**: Normalization → Tokenization (subword) → Embedding (lookup) → Positional Encoding (addition)

### Self-Attention Formula
For each token: Q = X·W_q, K = X·W_k, V = X·W_v. **Attention = softmax(QKᵀ / √d_k) · V**. Scaling by √d_k stabilizes the gradient. Example: In "The tiger jumped out of a tree to get a drink because it was thirsty", self-attention connects "the tiger" and "it".

### Multi-Head Attention
Multiple heads with independent Q/K/V projections run in parallel → concat → linear projection. Improves handling of long-range dependencies.

### Add & Norm + Feedforward
Residual + layer norm for each block, attention sublayer + position-wise FFN (two linear layers + ReLU/GELU).

### Variants
- **Encoder**: Input → contextual embedding (BERT)
- **Decoder**: Masked self-attention (autoregressive) + encoder-decoder cross-attention
- **Decoder-only**: Dominant form of modern LLMs (GPT/LLaMA/Gemini)
- **Encoder-only** (BERT): Incapable of generation

### Mixture of Experts (MoE)
Multiple experts + gating network. **Sparse activation** — only some experts are active per token. GLaM, Mixtral, Gemini 1.5/2.0.

## Reasoning Techniques
- **Chain-of-Thought (CoT)**: Generating intermediate steps
- **Tree-of-Thoughts (ToT)**: Multi-path exploration via searching
- **Least-to-Most prompting**: Progressive progression from sub-problems
- Instruction tuning, RLHF, knowledge distillation, beam search, temperature scaling, RAG ([[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]])

## Training
- Tokenizer: **BPE** or **Unigram** (HF, SentencePiece — Kudo & Richardson 2018)
- Loss: cross-entropy
- Objectives:
  - Decoder-only: next-token (shift)
  - Encoder-only (BERT): MLM (`The [MASK] sat on the mat`)
  - Encoder-decoder: seq2seq
- Context length trade-off: Longer contexts are richer, but compute/memory costs increase

## Model Evolution (Specific Models)
- **GPT-1** (OpenAI 2018, 117M, 1.25B tokens) — Decoder-only. BooksCorpus (5GB, 7000+ books) pre-training + supervised FT. Uses delimiter `$`.
- **BERT** (Google 2018) — Encoder-only. MLM + NSP. Strong at understanding tasks, incapable of generation.
- **GPT-2** (2019, 1.5B, 10B tokens) — WebText (40GB, 45M Reddit pages, karma≥3). Demonstrated **Zero-shot task transfer**. Performance scales log-linearly.
- **GPT-3 / 3.5 / 4** — GPT-3 175B, 300B tokens. Few-shot/zero-shot. **InstructGPT** (Ouyang 2022): SFT + RLHF — 1.3B InstructGPT outperformed 175B GPT-3 in human evaluation. GPT-3.5 turbo: 16,385 context. **GPT-4**: multimodal (image+text→text), 128K context.
- **LaMDA** (Google 2021, 137B) — optimized for open-ended dialogue.
- **Gopher** (DeepMind 2021, 280B, 300B tokens, 2.45B-doc 10TB MassiveText). cosine LR + 1500 warmup, gradient clip 1. SOTA on 81% of tasks. Weakness in abstract algebra/reasoning.
- **GLaM** (Google 2022, 1.2T) — First sparsely-activated MoE LLM. Uses ⅓ the energy and ½ the FLOPs compared to GPT-3.
- **Chinchilla** (DeepMind 2022, 70B) — Updated Kaplan scaling laws. **Kaplan**: N_opt ∝ C^0.73, D_opt ∝ C^0.27. **Chinchilla**: 100× compute → ~10× model + ~10× data equal scaling. 70B Chinchilla outperformed Gopher 280B / GPT-3 175B.
- **PaLM** (Google, 540B) — Pathways, two TPU v4 Pods.
- **PaLM 2** (May 2023) — Smaller but more powerful. Powers Google Cloud Generative AI.
- **Gemini** (December 2023) — Multimodal decoder-only with multi-query attention. Ultra/Pro/Nano/Flash. Ultra: SOTA on 30/32 benchmarks.
- **Gemini 1.5 Pro** (2024) — MoE. **Million-token context**. 100% recall up to ~530K, >99.7% up to ~1M, 99.2% up to ~10M. Completed 66% of multi-step tasks. Handles codebases, learns new languages, and analyzes movies.
- **Gemini 2.0 Flash / 2.0 Pro / 2.0 Nano / 2.0 Flash Thinking** — 1M input / 64K output, exposing "thought processes".
- **Gemma 1/2/3** — Open models. Gemma 1: 256K vocab, 6T tokens. Gemma 2 27B ≈ LLaMA 3 70B. Gemma 3: multimodal, 128K, 140+ languages.
- **LLaMA 1/2/3 (Meta)** — LLaMA 2: 7B/13B/70B, 4096 context, **grouped-query attention**, commercial license. LLaMA 3.2: multilingual + vision, on-device quantization.
- **Mixtral 8x7B (Mistral AI)** — SMoE, 47B total/13B active parameters, 32K context. Outperforms LLaMA 2 70B (math/code/multilingual). Apache 2.0.
- **OpenAI o1 / o1-mini** — RL-trained reasoning. 89th percentile on Codeforces, top 500 in AIME, outperforming PhDs on GPQA.
- **DeepSeek-R1-Zero / R1** — pure-RL via **GRPO (Group Relative Policy Optimization)** — evaluates relative to the group average without a critic. R1 multi-stage: SFT cold start → GRPO RL → rejection sampling → SFT → final RL. Matches/outperforms o1 on AIME 2024.
- Others: Qwen 1.5 (Alibaba 0.5B–72B), Yi (01.AI 6B/34B), Grok 3 (xAI, 1M context), GPT-NeoX, GPT-J, Alpaca, Vicuna, Falcon, PHI, NVLM, DBRX.

### Comparison Table (Selected)
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
- **Pretraining**: No labels, weeks to months, GPU/TPU intensive → **Fine-tuning**: Much cheaper, labeled data.
- **SFT Variants**: instruction/dialogue/safety tuning.
- **RLHF**: Train a reward model (initialized from SFT model) on human preference pairs → fine-tune SFT model using policy gradients. Captures safety, helpfulness, fairness, and truthfulness.
- **RLAIF** (Constitutional AI, Bai 2022): Replaced by AI labelers.
- **DPO** (Rafailov 2023): Optimizes preferences directly without an explicit RM.

### PEFT
- **Adapter** (Houlsby 2019): Insert small modules and train only them
- **LoRA** (Hu 2021): Approximates weight updates with two low-rank matrices. Original weights frozen. Modules can be swapped
- **QLoRA** (Dettmers 2023): LoRA on top of quantized weights
- **Soft prompting** (Lester 2021): Prepend learnable continuous prompt vectors (can be 5 tokens) to a frozen LLM
- Cost: full FT > LoRA > soft prompting (good) / Performance: full FT ≥ LoRA ≥ soft prompting

## Usage
### Prompt Engineering
Zero-shot, Few-shot (3–5 examples), CoT.

### Sampling / Decoding
- **Greedy** — argmax, repetitive
- **Random** — sampling proportional to probability, creative but risk of nonsense
- **Temperature** — logits / T. T>1 increases diversity, T<1 sharpening
- **Top-K** — top K tokens
- **Top-P (nucleus)** (Holtzman) — smallest set of tokens with cumulative probability ≥ P. Adapts to model confidence
- **Best-of-N** — generate N samples and select using a reward model
- Task-specific tuning: low T for factual QA, high T for creative tasks

### Evaluation
3 pillars: (1) evaluation set mirroring production traffic, (2) E2E evaluation (including RAG and agent workflows), (3) rubrics based on business outcomes. 3 methods: quantitative metrics / human evaluation / **LLM autorater** (calibrated with human judgment, watch out for position bias — Shi 2024).

## Inference Acceleration
### Trade-off
Quality vs Latency/Cost; Latency vs Cost (throughput).

### Output Approximation (Potential Accuracy Degradation)
- **Quantization** — FP32 → INT8/INT4. Memory, communication, and hardware fast-path. **QAT** > post-hoc. Example: MobileNet SSD achieved 2× speedup with a 2% accuracy loss (Jacob 2017). per-channel/group granularity (Zhang 2023).
- **Distillation**:
  - Data distillation (Bucila 2006) — teacher generates synthetic data
  - Knowledge distillation (Hinton 2015) — aligns student output distribution with the teacher
  - On-policy distillation (Agarwal 2024) — teacher feedback on student RL sequences

### Output Preservation (Identical Accuracy)
- **FlashAttention** (Tri Dao 2022) — IO-aware attention, minimizing data movement between HBM and SRAM/VMEM. 2–4× acceleration
- **Prefix Caching** — Reuses the KV cache from the prefill phase for requests sharing the same prefix. Provided as **Context Caching** in Google AI Studio and Vertex AI. Do not change prefixes (timestamps, etc.)
- **Speculative Decoding** (Leviathan 2022) — A small drafter generates candidate tokens first, and the target model verifies them in parallel. With a 10ms target model step + 1ms drafter step, 3 tokens take 13ms instead of 30ms. Quality-neutral

### Batching/Parallelism
Decode = memory-bound (suitable for batching), Prefill = compute-bound. Sequence/Pipeline/Tensor parallelism. Communication cost is the primary constraint.

## Applications
- **Code/Math**: AlphaCode 2 (Gemini + search/tools, top 15% on Codeforces), FunSearch (cap-set problem, bin-packing), AlphaGeometry (neuro-symbolic, 25/30 on IMO geometry)
- Translation, summarization, QA, chatbots, content generation, NLI, text classification, text analysis
- **Multimodal**: Image/video storytelling, personalized education, assistive technology, medical images + reports, drug discovery

## Key Takeaways
- Transformer is the foundation; both parameters and data configuration are important (Chinchilla scaling).
- Fine-tuning sequence: SFT → RLHF/RLAIF/DPO → PEFT (LoRA/soft prompting).
- Inference acceleration is divided into output approximation (quantization/distillation) and output preservation (FlashAttention/prefix caching/speculative decoding).
- Sampling parameters (T, top-K, top-P) are tuned depending on the task.

## Related Concepts
[[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/sources/whitepaper_emebddings_vectorstores_v2|Embeddings & Vector Stores]]
