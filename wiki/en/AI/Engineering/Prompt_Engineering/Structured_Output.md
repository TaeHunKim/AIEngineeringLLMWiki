---
order: 5
---

# Structured Output

## Overview

**Structured Output** is a technique that controls LLM output to be generated in accordance with a predefined schema such as JSON, YAML, or Pydantic. It converts LLM's free-form text generation into programmatic structured data, enabling integration with downstream applications.

## Why Is It Needed?

```
❌ Unstructured output:
"The user's name is John Doe and he is 30 years old.
He lives in Manhattan, New York."

✅ Structured output (JSON):
{
    "name": "John Doe",
    "age": 30,
    "address": {
        "city": "New York",
        "district": "Manhattan"
    }
}
```

Without structured output, integrating LLMs into actual applications is very difficult.

## JSON Output

### Prompt-Based Induction
```python
system_prompt = """
Always respond only in the following JSON format:
{
    "intent": "string",
    "entities": [{"type": "string", "value": "string"}],
    "confidence": 0.0~1.0
}
"""
```

### JSON Mode (API Support)
Major APIs like OpenAI and Anthropic provide JSON mode:
```python
# OpenAI
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},
    messages=[...]
)

# Anthropic (prefilling method)
response = client.messages.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "Analyze..."},
        {"role": "assistant", "content": "{"}  # Force JSON start
    ]
)
```

## Structured Output with Schema (OpenAI 2024)

OpenAI's Structured Outputs guarantees exact output format using JSON Schema:
```python
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    summary: str
    key_points: list[str]
    sentiment: Literal["positive", "negative", "neutral"]
    confidence: float

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[...],
    response_format=AnalysisResult,
)
result: AnalysisResult = response.choices[0].message.parsed
```

## Pydantic Integration

**Pydantic** is Python's data validation library. Parses LLM output in a type-safe manner:

```python
from pydantic import BaseModel, Field, validator
from typing import Optional

class ProductReview(BaseModel):
    product_name: str = Field(description="Product name")
    rating: int = Field(ge=1, le=5, description="Rating from 1-5")
    pros: list[str] = Field(description="List of pros")
    cons: list[str] = Field(description="List of cons")
    summary: str = Field(max_length=200)
    
    @validator('rating')
    def rating_must_be_valid(cls, v):
        if v not in range(1, 6):
            raise ValueError('Rating must be 1-5')
        return v

# LangChain's Pydantic output parser
from langchain.output_parsers import PydanticOutputParser
parser = PydanticOutputParser(pydantic_object=ProductReview)
```

## YAML Output

Suitable for config files and document structures. High human readability:
```yaml
# YAML structure to guide LLM to generate
task:
  title: Project planning
  subtasks:
    - id: 1
      description: Requirements analysis
      duration: 3 days
    - id: 2
      description: Architecture design
      duration: 5 days
  priority: high
  deadline: 2024-12-31
```

## Relationship with Function Calling / Tool Use

A special form of structured output. The LLM decides what function to call with what arguments:
```json
{
    "tool_name": "search_database",
    "parameters": {
        "query": "John Doe",
        "table": "users",
        "limit": 10
    }
}
```
→ See [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]]

## Instructor Library

A Python library for structured output. Naturally bridges Pydantic and LLM APIs:
```python
import instructor
from anthropic import Anthropic

client = instructor.from_anthropic(Anthropic())

class UserProfile(BaseModel):
    name: str
    age: int
    interests: list[str]

profile = client.messages.create(
    model="claude-sonnet-4-6",
    response_model=UserProfile,
    messages=[{"role": "user", "content": "Describe John Doe..."}]
)
# profile is automatically a UserProfile instance
```

## Handling Structured Output Failures

LLMs cannot always be guaranteed to generate perfect JSON:

```python
import json
from tenacity import retry, stop_after_attempt

@retry(stop=stop_after_attempt(3))
def get_structured_output(prompt: str) -> dict:
    response = llm.generate(prompt + "\nRespond only with valid JSON.")
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # Attempt JSON extraction
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        raise
```

## Role in AI Engineering

Structured output is the key bridge for integrating LLMs into actual software systems. Information Extraction, NLU pipelines, Tool Use, and Agent systems all depend on structured output. Building stable systems in production LLM applications is nearly impossible without structured output.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Prompt_Engineering/Sampling_Controls|Sampling Controls]] · [[en/AI/Engineering/Harness_Engineering/Guardrail_Engineering|Guardrail Engineering]]

## Sources
- OpenAI Structured Outputs documentation — [platform.openai.com](https://platform.openai.com/docs/guides/structured-outputs)
- Instructor library — [python.useinstructor.com](https://python.useinstructor.com)
- Pydantic official documentation — [docs.pydantic.dev](https://docs.pydantic.dev)
- Anthropic Tool Use documentation — [docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
