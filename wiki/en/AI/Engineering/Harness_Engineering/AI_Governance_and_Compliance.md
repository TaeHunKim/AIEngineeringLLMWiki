---
order: 9
---

# AI Governance and Compliance

## Overview

While [[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]] addresses the technical question "is the model actually aligned?", this document covers the **frameworks and regulations that compel safe AI development and deployment at the organizational, industry, and national level**. From frontier lab voluntary safety pledges to national laws, this document maps the governance landscape practitioners need to know.

## Frontier Safety Frameworks

Voluntary pledges adopted by major AI research labs that mandate additional safety measures when model capabilities cross specific risk thresholds.

### Anthropic Responsible Scaling Policy (RSP) v3.0

```
AI Safety Level (ASL) system:
  ASL-1: Obviously low-risk systems (e.g., chess engines)
  ASL-2: Current frontier model level — standard safety measures sufficient
  ASL-3: Capability level where risk of catastrophic misuse becomes significant
         → Enhanced security (prevent model weight leakage) + mandatory pre-deployment risk assessment
  ASL-4+: Undefined higher risk levels — additional safety measures must be defined before reaching them

Core mechanism: Conduct capability evaluation before new model release
               → If specific ASL threshold is crossed, deployment prohibited without that level's safety measures
```

### OpenAI Preparedness Framework and Google DeepMind FSF

```
OpenAI Preparedness Framework:
  Scores capabilities in 4 domains — cybersecurity, CBRN (Chemical/Biological/Radiological/Nuclear),
  persuasion, and model autonomy — as Low/Medium/High/Critical
  → High or above requires mandatory mitigation before deployment

Google DeepMind Frontier Safety Framework (FSF):
  Defines similar risk thresholds under the concept "Critical Capability Level (CCL)"
  Manages thresholds by specific risk capability categories:
  self-replication, automated cyberattacks, etc.
```

All three frameworks share a common philosophy: **safety measures strengthen proportionally as capabilities increase**, documented in advance to prevent "capabilities suddenly reaching dangerous levels with no countermeasures."

## METR External Evaluation and Independent Auditing

Self-evaluation by frontier labs alone raises conflict of interest concerns. **METR** (introduced as the Time Horizon benchmark in [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]]) acts as a third-party institution that independently evaluates models from multiple labs before release.

```
METR's external evaluation process:
  Labs provide early access to METR before model release
    → METR independently evaluates dangerous capabilities: autonomous replication, cyberattacks, AI research acceleration
      → Evaluation results publicly cited in model cards/system cards
```

**Value of independent evaluation**: Lab self-evaluation has incentives to conclude "our model is safe," while independent institutions like METR can compare multiple labs on the same standard, providing more trustworthy signals.

## CAIS and CAISI — Societal-Scale Risks

**CAIS (Center for AI Safety)** is a nonprofit researching societal-scale risks from AI — mass unemployment, power concentration, gradual loss of control, etc. **CAISI** (successor institutions to the US AI Safety Institute) handle government-level assessment of frontier models' national security and public safety impact.

```
Risk categories covered by CAIS/CAISI:
  - Misuse risks: malicious use like bioweapons, cyberattacks
  - Accident risks: widespread impact from unintended system malfunction
  - Structural risks: labor market disruption, power concentration, increased AI dependence in decision-making
```

## Regulatory Frameworks: EU, US, UK, and Beyond

### EU AI Act

The most comprehensive legally binding AI regulation. **Risk-based tiering** is the core structure.

```
Risk levels:
  Unacceptable Risk (prohibited): Social Scoring, real-time biometric surveillance, etc.
  High Risk (strict regulation): AI used in hiring, credit scoring, medical devices, etc.
                                → Risk management systems, data governance, human oversight mandatory
  Limited Risk: Chatbots etc. — must disclose that user is interacting with AI
  Minimal Risk: Most AI applications — low regulatory burden

General-Purpose AI (GPAI) model separate regulation:
  Foundation models exceeding certain computing thresholds face additional "systemic risk" obligations
  (transparency documentation, model evaluation, incident reporting, etc.)
```

### United States

No comprehensive federal AI law, but Executive Orders and state legislation (California SB 1047 series, etc.) partially regulate frontier model safety and transparency. Sector-specific regulations (FDA for healthcare, existing financial regulators) increasingly extend to AI applications.

### United Kingdom

Instead of separate legally binding AI law, existing regulators (ICO, FCA, etc.) regulate AI in their respective domains — **sector-based, principle-based** approach. The AI Safety Institute (now reorganized as AI Security Institute) handles frontier model national security risk assessment.

### Korea

The **AI Basic Act** (enacted 2024, effective 2026) mandates safety for high-impact AI, requires disclosure of AI-generated content (informing users when content is AI-generated), etc. Similar risk-based structure to EU AI Act, with detailed guidelines and notifications continuously being specified.

## Model Cards, System Cards, and Dataset Cards

Standard practice for transparently documenting capabilities, limitations, and evaluation results of frontier models. The practical intersection of regulatory compliance and user trust.

```
Model Card:
  Training data overview, intended uses, known limitations, benchmark performance

System Card:
  Broader scope than model card — entire deployed system (including guardrails, safety evaluations, red team results)

Dataset Card:
  Data sources, collection methods, known biases, license information
```

## Data Provenance and Training Data Governance

Tracking and managing training data **provenance** is needed for copyright dispute response, data contamination prevention ([[en/AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]]), and regulatory compliance (EU AI Act's data governance requirements). Maintaining provenance metadata from the data collection pipeline stage costs far less than post-hoc auditing.

## Dual-Use Risks and WMDP

**Dual-Use risk** is the problem where legitimate research purposes and malicious misuse purposes share the same knowledge and capabilities — for example, pathogen biology knowledge can be used for both vaccine development and bioweapon creation.

```
Major areas of concern: Cyber, Bio, Chem, Nuclear

WMDP (Weapons of Mass Destruction Proxy) benchmark:
  A proxy benchmark designed to measure a model's level of dangerous knowledge
  without directly including actual dangerous information
  → Key design: measures how "capable" a model is in dangerous domains
    while ensuring the benchmark itself doesn't become a vector for leaking dangerous information
```

RSP and Preparedness Framework CBRN risk assessments practically use this benchmark family.

## Practitioner Checklist

```
Governance checks before production deployment:
  □ Verify regulatory classification in target jurisdiction (EU AI Act high-risk classification, etc.)
  □ Decide whether to prepare and publish model/system card
  □ Document provenance and licenses of training/fine-tuning data
  □ Comply with AI-generated content disclosure requirements (Korea AI Basic Act, EU AI Act Limited Risk)
  □ For high-impact domains (healthcare, finance, hiring): separately check existing sector-specific regulations
  □ For fine-tuning/deploying frontier models: verify compliance with that lab's usage policies (RSP, etc.)
```

## Role in AI Engineering

AI Governance and Compliance bridges the gap between technical safety measures ([[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]], [[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]]) and organizational and legal accountability. If frontier labs' voluntary pledges (RSP/Preparedness/FSF) establish the principle of "safety measures proportional to capabilities," legal regulations like the EU AI Act enforce this across the industry. For practitioners, both layers are real constraints — one through the policies of the frontier model used, the other through direct regulation of their own applications.

## Related Concepts
[[en/AI/Engineering/Harness_Engineering/Alignment_Research|Alignment Research]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Harness_Engineering/Red_Teaming|Red Teaming]] · [[en/AI/Engineering/Agent_Engineering/Autonomous_Systems|Autonomous Systems]] · [[en/AI/Engineering/Harness_Engineering/Benchmarking|Benchmarking]]

## Sources
- Anthropic "Responsible Scaling Policy" — [anthropic.com](https://www.anthropic.com/rsp)
- OpenAI "Preparedness Framework" — [openai.com](https://openai.com/safety/preparedness/)
- Google DeepMind "Frontier Safety Framework" — [deepmind.google](https://deepmind.google/discover/blog/updating-the-frontier-safety-framework/)
- METR "About" — [metr.org](https://metr.org/about)
- Center for AI Safety "Statement on AI Risk" — [safe.ai](https://safe.ai/work/statement-on-ai-risk)
- European Commission "EU Artificial Intelligence Act" — [artificialintelligenceact.eu](https://artificialintelligenceact.eu)
- Li et al. (2024) "The WMDP Benchmark" — [arXiv:2403.03218](https://arxiv.org/abs/2403.03218)
- Mitchell et al. (2019) "Model Cards for Model Reporting" — [arXiv:1810.03993](https://arxiv.org/abs/1810.03993)
