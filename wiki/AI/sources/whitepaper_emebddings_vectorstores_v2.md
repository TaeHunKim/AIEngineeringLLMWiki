# Whitepaper: Embeddings & Vectorstores

## 메타데이터
- **파일명**: `whitepaper_emebddings_vectorstores_v2.pdf`
- **저자**: Anant Nawalgaria, Xiaoqi Ren, Charles Sugnet (Google)
- **발행 시점**: 2025년 2월
- **주제**: [[Embeddings]] (text/image/multimodal/structured/graph), 벡터 검색 알고리즘 (LSH, HNSW, ScaNN), [[Vectorstore]], 그리고 LLM과 결합된 [[RAG]] 활용
- **출처 (URL)**: https://www.kaggle.com/whitepaper-embeddings-and-vector-stores

## 요약
임베딩은 이질적 데이터(텍스트·이미지·오디오·비디오)를 공유 벡터 공간으로 매핑하는 "lossy compression"이다. BERT가 텍스트를 768차원 벡터로 매핑한다는 단순 사실에서 출발해, 평가 지표(Precision@k, Recall@k, nDCG, BEIR/MTEB), 임베딩 모델의 진화, ANN 알고리즘, 벡터 DB 제품군, 그리고 RAG에서의 종합적 활용을 다룬다.

## 임베딩의 본질
- 의미적 유사성 = 기하학적 거리. 비유: 위도/경도가 위치의 2D 임베딩.
- 다른 모델이 만든 임베딩은 호환되지 않는다 → 일관된 버전 필수.
- **3-step retrieval**: (1) 코퍼스 임베딩 사전 계산, (2) 쿼리 임베딩, (3) NN 검색.

## 평가
- **Precision@k** = 검색된 것 중 관련 비율 (예: 7/10 = 0.7)
- **Recall@k** = 전체 관련 중 검색된 비율
- **nDCG**: DCG = Σ rel_i / log2(i+1); 이상적 순서로 정규화 (0.0–1.0)
- **벤치마크**: **BEIR** (zero-shot retrieval), **MTEB** (Massive Text Embedding Benchmark)
- 도구: trec_eval, pytrec_eval
- 진척도: 원조 BERT의 BEIR ~10.6 → 현재 Google 2025 임베딩 평균 55.7

## 코드 예 (NFCorpus)
- **Two-tower (asymmetric dual encoder)** — 쿼리/문서 분리 네트워크 (Figure 9b). vs siamese (Figure 9a)
- Vertex `text-embedding-005` (768D), task type `RETRIEVAL_DOCUMENT`/`RETRIEVAL_QUERY`
- FAISS `IndexFlatL2` (Euclidean), top-K
- 결과 예: P_1 = 0.517, recall_10 = 0.204, ndcg_cut_10 = 0.403
- **Gecko paper** (Lee et al., 2024) — LLM 합성 Q-D 쌍으로 더 좋은 임베딩 학습

## Tokenization
String → tokens (wordpiece/character/word/숫자/punct) → integer ID (vocab_size 범위) → optional one-hot. Keras `Tokenizer` 예시.

## Word Embedding (Context-free)
- **Word2Vec** (Mikolov 2013) — CBOW (context → middle, 빈도 단어 우수) vs Skip-gram (middle → context, 희귀어 우수)
- **GloVe** (Pennington/Socher/Manning 2014) — 글로벌 동시발생 행렬 분해
- **SWIVEL** (Shazeer 2016) — 분산 병렬 행렬 분해, 빠름
- **FastText** — Word2Vec + subword

## Document Embedding
### Shallow / Bag-of-Words
- **LSA** (1990), **LDA** (2001), **TF-IDF / BM25** (강력한 baseline), **Doc2Vec** (Le & Mikolov 2014)
- 한계: 단어 순서·심층 의미 무시

### Deep / Pretrained
- **BERT** (Devlin 2018) — bidirectional encoder, MLM + NSP, [CLS] token = sentence vector
- **Sentence-BERT** (Reimers & Gurevych 2020), **SimCSE** (Gao 2021), **E5** (Wang 2022)
- **T5** (2019, 11B), **PaLM** (2022, 540B), **Gemini**, **GPT**, **LLaMA** — backbone들
- **GTR**, **Sentence-T5** — BERT-family 능가
- **Gemini 기반 Vertex 임베딩** — 공개 벤치마크 SOTA
- **Matryoshka Embedding** (Kusupati 2022; Matryoshka Quantization 2025) — 차원 가변 → 저장 공간 절약
- **Multi-vector**: **ColBERT** (Khattab & Zaharia 2020), **XTR** (Lee 2023), **ColPali** (Faysse 2024 — OCR 없이 이미지로 문서 처리)

## Image & Multimodal
- 이미지 임베딩: CNN/ViT의 penultimate layer
- Multimodal: 단일 잠재 공간으로 정렬. Vertex `multimodalembedding@001`
- ColPali: 문서를 렌더링된 이미지로 처리

## Structured / Graph Embeddings
- 일반 structured: PCA 류 차원 축소 → 이상 탐지
- User/item: 추천 (사용자·상품 벡터를 한 공간에)
- Graph: **DeepWalk, Node2Vec, LINE, GraphSAGE** (Hamilton 2017)

## 임베딩 학습
Dual-encoder 지배적. **Contrastive loss**: <anchor, positive, [negatives]> — 양/음을 끌어당기고 밀어냄. Foundation model(BERT/T5/GPT/Gemini/CoCa)에서 초기화 후 fine-tune. 데이터: 인간 라벨링, 합성, distillation, hard-negative mining.

## Vector Search Algorithms
- **유사도 척도**: Euclidean(저차원), cosine(고차원), dot product (정규화 시 cosine과 동치)
- 브루트 포스는 O(N) — 수백만 이상에서 ANN(approximate NN)으로 O(log N)

### LSH (Locality Sensitive Hashing)
유사 항목을 같은 버킷에 매핑하는 hash. 버킷 + 인접 검색. 우편번호 lookup 비유.

### Tree-based
- **KD-tree** (Friedman 1977), **Ball-tree** (고차원에 더 적합)

### HNSW (Hierarchical Navigable Small World, Malkov & Yashunin 2016)
- 멀티레이어 proximity graph. 위층은 long link, 아래는 short
- 위층부터 greedy 탐색 → 각 층 local minimum
- O(log N), quantization 결합 가능
- FAISS: `IndexHNSWFlat(d, M=32)`

### ScaNN (Google, Guo 2020)
- **anisotropic vector quantization** (PQ보다 우수)
- 단계: (1) optional 분할 (heuristic ≈ √N), (2) top partition 선택, (3) 정확/근사 거리, (4) optional rescoring
- TF Recommenders: `tfrs.layers.factorized_top_k.ScaNN(distance_measure='dot_product', num_leaves=4, num_leaves_to_search=2)`

### FAISS (Facebook, Douze 2024)
HNSW, PQ 등 다수 인덱스 지원

## Vector Databases
- **Managed**: Google Cloud **Vertex AI Vector Search** (ScaNN 기반, `MatchingEngineIndex.create_tree_ah_index(...)`), **AlloyDB** & **Cloud SQL Postgres** (pgvector + AlloyDB native ScaNN), **Elasticsearch**, **Pinecone** (HNSW), **Weaviate** (HNSW), **BigQuery vector search** (OLAP/배치)
- **OSS**: Weaviate, ChromaDB, pgvector
- **Hybrid search**: vector ANN + keyword + 메타데이터 필터

## 운영 고려사항
- 임베딩은 모델 재학습 시 변동 → 자동 re-embedding/purge 필요
- 임베딩은 literal/syntactic (ID/코드) 표현이 약함 → full-text 결합
- 워크로드: OLTP → AlloyDB/Spanner/Postgres/CloudSQL, OLAP → BigQuery vector search

## 응용
- 검색 (Q&A, 추천), 시멘틱 텍스트 유사도, 분류, 클러스터링, reranking
- **Q&A with sources (RAG)**: 검색 → 프롬프트 확장 → grounded 답변. Halluc 감소, 재학습 없이 신선도 확보
- 코드 예: LangChain `RetrievalQA.from_chain_type(llm=VertexAI(model_name="gemini-pro"), chain_type="stuff", retriever=...)`. 768D `text-embedding-005`, `DOT_PRODUCT_DISTANCE`, `STREAM_UPDATE`

## Key Takeaways
- 임베딩 모델은 데이터 분포에 맞춰 선택, 필요시 fine-tune.
- ScaNN과 HNSW가 속도/정확도 trade-off의 표준이다.
- Embeddings + Vector DB + ANN = 검색·추천·RAG의 인프라 substrate.

## 관련 개념
[[Embeddings]] · [[Vectorstore]] · [[RAG]] · [[Foundational_Models]] · [[Fine-Tuning]]
