---
order: 0
---

# Model Types (모델 유형)

## 개요

모델을 "무엇을 입력받아 무엇을 출력하는가"로 분류하면 선택·평가·서빙 기준이 명확해진다. 토큰 시퀀스를 생성하는 **LLM**·**Multimodal Model**(VLM), 벡터를 출력하는 **Embedding Model**·**Multimodal Embedding Model**, 선택지·척도·명제에 보정된 확률만 반환하는 **Decision Model**이 이 위키가 구분하는 네 축이다. 같은 Transformer backbone을 쓰더라도 출력 형태가 다르면 학습 방법([[AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training_and_Tuning]])과 구조적 선택([[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Architecture_and_Efficiency|Architecture_and_Efficiency]])을 적용하는 지점이 전혀 달라진다.

## 하위 문서

| 문서 | 내용 |
|------|------|
| [[AI/Engineering/Model_Engineering/Model_Types/Large_Language_Models\|Large_Language_Models]] | 디코더 전용 Transformer 기반 범용 생성 모델 — base/instruct/reasoning, open/closed weight |
| [[AI/Engineering/Model_Engineering/Model_Types/Multimodal_Models\|Multimodal_Models]] | VLM 아키텍처(어댑터 결합형 vs 네이티브), 이미지 토큰화, 오디오/비디오, MMMU/DocVQA |
| [[AI/Engineering/Model_Engineering/Model_Types/Embedding_Models\|Embedding_Models]] | 임베딩·리랭커 모델 자체 — Bi/Cross-encoder/Late Interaction, Matryoshka, MTEB |
| [[AI/Engineering/Model_Engineering/Model_Types/Multimodal_Embeddings\|Multimodal_Embeddings]] | 멀티모달 임베딩 모델 — 정렬 학습, modality gap, EmbeddingGemma 2 · Gemini Embedding 2 |
| [[AI/Engineering/Model_Engineering/Model_Types/Decision_Models\|Decision_Models]] | Jev 계열 System One Model, Choice/Score/Noul 프리미티브, logprob wrapper vs 학습형, calibration(ECE) |

## 관련 개념
[[AI/Engineering/Model_Engineering/Model_Engineering|Model Engineering]] · [[AI/Engineering/Model_Engineering/Training_and_Tuning/Training_and_Tuning|Training and Tuning]] · [[AI/Engineering/Model_Engineering/Architecture_and_Efficiency/Architecture_and_Efficiency|Architecture and Efficiency]] · [[AI/Engineering/Context_Engineering/Retrieval_Strategies/Retrieval_Strategies|Retrieval Strategies]]
