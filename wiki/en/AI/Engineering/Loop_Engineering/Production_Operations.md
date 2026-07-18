---
order: 4
---

# Production Operations

## Overview

If [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]] addresses "how to process each request cheaply and quickly," Production Operations addresses **how to safely deploy, route, observe, and bill LLM traffic across the entire organization**. The moment multiple teams, multiple models, and multiple vendors intersect, individual optimizations alone become insufficient — organizational-level infrastructure like gateways, deployment strategies, and compliance becomes necessary.

## Managed LLM Platforms and Inference Platform Economics

```
Managed LLM Platforms:
  AWS Bedrock · Azure OpenAI Service · Google Vertex AI
  → Vendor handles model hosting/scaling, easy integration with enterprise IAM/compliance
  → Trade-off: model choices limited to vendor catalog, vendor lock-in

Inference-Specialized Platforms (Inference Platform Economics):
  Fireworks · Together AI · Baseten · Modal
  → Open-weight models on custom serving stacks (vLLM/SGLang etc.) with pay-per-use
  → Often cheaper than managed platforms, but SLA/compliance certifications require self-verification
```

The selection criteria typically fall on three axes: compliance requirements (finance/healthcare prefers managed), model customization needs (fine-tuned open-weight prefers inference-specialized platforms), and Total Cost of Ownership.

## AI Gateways

A **single control point** for traffic passing through multiple LLM Providers, internal teams, and MCP Servers. Overlaps with the MCP Gateway/Registry ecosystem covered in [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]], but AI Gateways are a broader concept covering not just MCP traffic but all LLM API calls.

| Gateway | Features |
|---------|---------|
| **LiteLLM** | Integrates 100+ LLM Providers as OpenAI-compatible API, open-source, self-hostable |
| **Portkey** | Specialized in observability, caching, and fallback policies; built-in prompt version management |
| **Kong** | AI plugins on general-purpose API Gateway — easy integration with existing API infrastructure |
| **Bifrost** | High-performance Go-based AI gateway, targeting low overhead |

```
What the gateway handles centrally:
  - Authentication/authorization integration (so multiple teams don't each manage API keys)
  - Automatic fallback on provider failure (OpenAI failure → auto-switch to Anthropic)
  - Rate limiting and per-team quotas
  - Centralized logging and cost aggregation for all traffic
```

## Deployment Strategies: Shadow, Canary, Progressive Deployment

Strategies for safely deploying new model/prompt/agent versions to production. The infrastructure basis for the Safe Rollout 4 strategies (Canary/Blue-Green/A-B/Feature Flags) covered in [[en/AI/Engineering/Agent_Engineering/AgentOps|AgentOps]].

```
Shadow Deployment:
  New version receives "copy" of real traffic and processes it, but results are not exposed to users
  → Safely validate under real traffic conditions (0% user impact)

Canary Deployment:
  Gradually expand 1% → 5% → 25% → 100% of traffic
  → Check error rate and quality metrics at each stage before proceeding

Progressive Deployment:
  Automate Canary with metric-based triggers — auto-rollback when pre-defined thresholds are exceeded
```

## A/B Testing: GrowthBook and Statsig

Statistically verifies the impact of prompt, model, and agent architecture changes on actual business metrics (conversion rate, user satisfaction, task completion rate).

```python
# GrowthBook-style Feature Flag-based A/B test (conceptual)
from growthbook import GrowthBook

gb = GrowthBook(api_host="https://cdn.growthbook.io", client_key="...")
variant = gb.get_feature_value("prompt-version", "control")  # "control" or "treatment"

system_prompt = PROMPT_V1 if variant == "control" else PROMPT_V2
# Then compare task completion rate and cost for each group to determine winner
```

**LLM-specific considerations**: Unlike traditional web A/B tests, LLM responses are non-deterministic, requiring larger sample sizes, and quality metrics often need to be quantified via [[en/AI/Engineering/Harness_Engineering/LLM_as_a_Judge|LLM-as-a-Judge]].

## Load Testing

```
k6:          General-purpose load testing tool; define load scenarios for LLM API endpoints with scripts
LLMPerf:     LLM serving-specialized — simultaneously measures TTFT, inter-token latency (ITL), and throughput
GenAI-Perf:  NVIDIA's generative AI-specialized benchmarking tool, optimized for serving engine comparison
```

Unlike general web services, LLM load testing must measure not just response "completion time" but also streaming-specific metrics like TTFT (Time-to-First-Token) and TPOT (Time-per-Output-Token) covered in [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]] to reflect actual perceived user speed.

## SRE for AI and Chaos Engineering

**Multi-agent incident response**: The STRATUS pattern (Detection/Diagnosis/Validation 3-agent trio) covered in [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]] is actually an application of SRE's incident response process to agent systems. Traditional SRE practices (on-call, post-mortems, SLOs) are extended with LLM-specific failure modes (hallucination, prompt injection, model vendor outages).

**Chaos Engineering**: Intentionally inject failures in production-like environments (model API timeouts, MCP Server down, context window overflow) to validate system resilience. A real-world drill to confirm that the Retry Storm and Circuit Breaker defenses from [[en/AI/Engineering/Agent_Engineering/Multi_Agent_Coordination|Multi-Agent Coordination]] actually work before production.

## Security Operations: Secrets, PII, Audit Logs

```
Secrets management:
  Never hardcode API keys and auth tokens in code/prompts — use Vault, AWS Secrets Manager, etc.
  MCP Server credentials especially need attention (→ see MCP security threats in [[en/AI/Engineering/Agent_Engineering/Agent_Skills_and_Protocols/MCP|MCP]])

PII scrubbing:
  Automatically mask user personal information so it doesn't remain as-is in logs/traces
  → Apply the same techniques as in [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] Output Validation to the logging pipeline

Audit Logs:
  Preserve immutable records of "who, when, with what prompt, called which tool"
  → Combined with Agent Identity from [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]], per-agent accountability tracking becomes possible
```

## Compliance

Regulatory frameworks like SOC 2, HIPAA, GDPR, EU AI Act, and ISO 42001 impose technical controls on LLM production systems (data processing location restrictions, log retention periods, explainability requirements) that must be reflected in system design. For the regulations themselves and organizational governance perspective → [[en/AI/Engineering/Harness_Engineering/AI_Governance_and_Compliance|AI Governance and Compliance]]

## FinOps for LLMs

Traditional cloud FinOps (cost visibility, optimization, governance) specialized for LLM cost structures.

```
Unit Economics:
  Cost per request = (input tokens × input price + output tokens × output price) / requests
  → Track this unit economics per feature and per customer segment to understand
    which features are actually profitable

Multi-Tenant Cost Attribution:
  When shared infrastructure (cache, batch processing, fine-tuned models) is used by multiple customers/teams,
  an accounting system that accurately allocates costs in proportion to actual consumption
  → An organizational-scale extension of the Cost Control Loop in [[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]]
```

## Role in AI Engineering

Production Operations is the layer that operates individual optimization techniques ([[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]]) safely, observably, and with accountability tracking at organizational scale. At the scale where a single prompt change or model upgrade affects millions of users, releasing a change without gateways, progressive deployment, A/B testing, and chaos engineering itself becomes a risk.

## Related Concepts
[[en/AI/Engineering/Loop_Engineering/Runtime_Optimization|Runtime Optimization]] · [[en/AI/Engineering/Agent_Engineering/AgentOps|AgentOps]] · [[en/AI/Engineering/Agent_Engineering/Agent_Deployment|Agent Deployment]] · [[en/AI/Engineering/Harness_Engineering/Observability_and_Tracing|Observability & Tracing]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Harness_Engineering/AI_Governance_and_Compliance|AI Governance and Compliance]]

## Sources
- LiteLLM official docs — [docs.litellm.ai](https://docs.litellm.ai)
- Portkey official docs — [portkey.ai/docs](https://portkey.ai/docs)
- GrowthBook official docs — [docs.growthbook.io](https://docs.growthbook.io)
- Statsig official docs — [docs.statsig.com](https://docs.statsig.com)
- Grafana k6 docs — [k6.io/docs](https://k6.io/docs/)
- Ray Project "LLMPerf" — [github.com/ray-project/llmperf](https://github.com/ray-project/llmperf)
- NVIDIA "GenAI-Perf" — [github.com/triton-inference-server/perf_analyzer](https://github.com/triton-inference-server/perf_analyzer)
- FinOps Foundation "FinOps for AI" — [finops.org](https://www.finops.org/)
