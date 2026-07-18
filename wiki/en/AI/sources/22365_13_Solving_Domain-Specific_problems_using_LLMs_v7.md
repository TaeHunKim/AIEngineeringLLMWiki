# 22365_13 — Solving Domain-Specific Problems Using LLMs v7

## Metadata
- **Filename**: 22365_13_Solving Domain-Specific problems using LLMs_v7.pdf
- **Author**: Christopher Semturs, Shekoofeh Azizi, Scott Coull, Umesh Shankar, Wieland Holfelder (Google)
- **Published**: February 2025
- **Topic**: A case study of two domain-specific LLMs: cybersecurity (SecLM) and healthcare (MedLM/Med-PaLM) — [[en/AI/sources/22365_13_Solving_Domain-Specific_problems_using_LLMs_v7|Domain-Specific LLMs]], [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]], [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]], [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]]
- **Source (URL)**: https://www.kaggle.com/whitepaper-solving-domains-specific-problems-using-llms

## Summary
General-purpose LLMs have three fundamental limitations in specialized domains like cybersecurity and healthcare: a lack of public data, highly specialized language, and sensitive use cases. This document details how Google overcame these limitations through SecLM API (cybersecurity) and Med-PaLM 2/MedLM (healthcare). The core strategy is a customized pipeline combining a **3-layer architecture** with **PET adapters**.

---

## 1. Cybersecurity — SecLM

### The Need for Domain-Specific Adaptation: The 3T Challenges
Three challenges faced by security practitioners:
1. **Threats** — New attack techniques emerge daily, making threat intelligence quickly outdated.
2. **Toil** — Security analysts lose time on repetitive tasks such as sorting through hundreds of alert triages, writing queries, and generating reports.
3. **Talent** — A global shortage of cybersecurity experts forces entry-level analysts into the field without professional training.

### Limitations of General-Purpose LLMs
- **Lack of public security data**: Cybersecurity data is highly sensitive, so most of it remains private. Publicly available resources are heavily biased toward a few products.
- **Lack of deep security language**: General-purpose models cannot process specialized terminology that spans from low-level computer science to high-level policy and intelligence analysis.
- **Avoidance of sensitive use cases**: General-purpose models avoid tasks like malware analysis and phishing detection due to the risk of abuse.

### SecLM: 3-Layer Architecture
```
┌──────────────────────────────────────────────────┐
│  Top Layer: Existing Security Tools (SIEM, EDR)  │  ← Context Awareness + Action Execution
├──────────────────────────────────────────────────┤
│  Middle Layer: SecLM API                         │  ← Advanced Reasoning + Planning + RAG
├──────────────────────────────────────────────────┤
│  Bottom Layer: Authoritative Threat Intel DB     │  ← Threat Info + Operational Expertise
└──────────────────────────────────────────────────┘
```

### SecLM Training Pipeline (Based on Figure 1)
| Stage | Content |
|------|------|
| Pre-training | Large-scale Foundation Model (trillions of tokens of general text, code, and structured data) |
| Continued Pre-training | Open-source and licensed content such as security blogs, threat intelligence reports, detection rules, and IT books |
| Supervised Fine-tuning | Task-specific SFT including malicious script analysis, command-line explanations, security event summarization, and SIEM query generation |
| PET Adapters | Lightweight parameter-efficient tuning tailored to specific user environments (new platforms and asset information) |

**Key concept**: Proprietary data is not integrated into the core model but is separated into PET adapters, maintaining both security and generalization.

### Example of 5-Step Multi-Step Reasoning (APT41 Analysis)
1. Search for the latest APT41 TTP (Tactics, Techniques, and Procedures) information from the threat intelligence service.
2. Extract and synthesize TTPs and IOCs (Indicators of Compromise) from vast intelligence data.
3. The PET fine-tuned query translator generates queries matching the schema of the target SIEM.
4. Directly query matching security events in the SIEM.
5. SecLM aggregates all information into a comprehensive response for the analyst.

**Result**: Tasks that used to take several hours were automated. Achieved a **53–79% win rate** in security-specific tasks compared to general LLMs.

### Evaluation Methodology
- **Classification Tasks** (e.g., malware classification): Standard classification metrics
- **Similarity-based**: ROUGE, BLEU, and BERTScore compared against golden responses
- **Automated SxS (Side-by-Side)**: Preference evaluation using a large LLM as a judge
- **Human Expert Evaluation**: Likert scale + SxS preference evaluation

---

## 2. Healthcare — Med-PaLM 2 / MedLM

### Opportunities for Healthcare AI
- Answering questions based on the context of patient electronic health records (EHR)
- Triaging patient messages to clinicians (urgency classification)
- Dynamically adapting patient intake procedures (from fixed questions to response-based customization)
- Real-time monitoring and feedback of doctor-patient conversations during clinical visits
- On-demand curbside consults for unfamiliar medical conditions

### Evolution from Med-PaLM to Med-PaLM 2
| Version | Publication | Achievement |
|------|------|------|
| Med-PaLM | Preprint in late 2022, Nature July 2023 | **First to exceed the USMLE passing mark (67%)** |
| Med-PaLM 2 | Preprint in March 2023 (arXiv:2305.09617) | **86.5% on USMLE** — expert-level performance, a +19% improvement over the previous version |

Med-PaLM 2 is built on PaLM 2 with instruction fine-tuning using the MultiMedQA dataset (MedQA, MedMCQA, HealthSearchQA, LiveQA, MedicationQA).

### Three Training Strategies
1. **Few-shot prompting**: Including examples in the input to guide specific tasks
2. **Chain-of-Thought (CoT) prompting**: Including step-by-step reasoning in the few-shot examples, enabling multi-step reasoning based on intermediate outputs
3. **Ensemble Refinement (ER)**:
   - Step 1: Stochastically generate various explanations and answers using temperature sampling
   - Step 2: Generate the final refined answer by conditioning on the original prompt and the Step 1 outputs
   - Benefit: More flexible than self-consistency, applicable even to questions without a restricted set of correct answers

### Clinical Evaluation Framework (Figure 6)
Key criteria of the clinical evaluation rubric:
- Alignment with scientific and clinical consensus
- Extent and likelihood of potential harm
- Accuracy in reading comprehension, knowledge recall, and reasoning steps
- Inclusion of inappropriate content / omission of critical information
- Presence of inaccurate information specific to certain demographic groups
- Responsiveness to user intent and level of practical helpfulness

**Evaluation Procedure**: Med-PaLM and board-certified physicians independently responded to the same questions, and blind evaluators compared the two sides.

### Distinguishing Between Task vs. Domain Specificity
While Med-PaLM 2 showed a **9x improvement in precision reasoning** compared to the base PaLM 2 model, a model that performs well in general medical QA still requires separate validation and adaptation for mental health evaluation tasks. Even within the same domain, **task-specific validation** is essential.

### Three Stages of Clinical Environment Integration
1. **Retrospective evaluation**: Evaluating using historical, de-identified real-world case data
2. **Prospective observational (non-interventional)**: Feeding in real-time data and having clinicians review the outcomes — no impact on patient care
3. **Prospective interventional**: Deploying in a real clinical setting under an IRB-approved protocol and measuring the impact on patient care

---

## Key Takeaways
- Domain-specific LLMs deliver the best performance using a **3-layer architecture** (tool layer + model API + data store).
- **PET adapters** are a key technique for leveraging sensitive data without contaminating the core model.
- Med-PaLM 2's **Ensemble Refinement** goes beyond simple majority voting by performing self-conditioned answer refinement.
- Clinical AI experiences from diabetic retinopathy screening reconfirmed that benchmark performance does not equal real-world clinical performance — stepwise validation is essential.
- In both security and healthcare, **"technology alone is not enough"** — collaboration with human expertise is the key to success.

## Related Concepts
[[en/AI/sources/22365_13_Solving_Domain-Specific_problems_using_LLMs_v7|Domain-Specific LLMs]] · [[en/AI/Engineering/Model_Engineering/Full_Fine-Tuning|Full Fine-Tuning]] · [[en/AI/Engineering/Context_Engineering/Retrieval_Strategies/RAG/RAG|RAG]] · [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]] · [[en/AI/sources/whitepaper_Foundational_Large_Language_models_&_text_generation_v2|Foundational LLMs]] · [[en/AI/Engineering/Agent_Engineering/Planning_and_Reflection|Planning & Reflection]]
