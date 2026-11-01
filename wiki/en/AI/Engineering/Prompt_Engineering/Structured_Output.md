---
order: 5
---

# Structured Output

## Overview

**Structured Output** is a method for aligning a model's output with a data contract that downstream programs can interpret. JSON is a serialization format, JSON Schema is a structure and type constraint, and Pydantic is a Python validation tool. These are not treated as the same type of output format.

## Three Levels of Guarantee

| Level | What it checks | What it does not guarantee |
|---|---|---|
| Valid JSON | Parsable by JSON parser | Presence of required keys, types, or correctness |
| Schema Compliance | Adherence to supported schema constraints | Truthfulness of values, business rules, or execution permissions |
| Semantic Validation | Consistency with the source, satisfaction of business invariants | Not obtained automatically; requires explicit validation |

Requesting JSON with a prompt is different from API constrained generation. JSON Mode is not the same as JSON Schema compliance. A model-generated `confidence` value should not be interpreted as the probability of correctness until its calibration has been evaluated.

## Contract by Provider

This is based on the official documentation as of 2026-11-01. Support conditions for each model, endpoint, and SDK version are fixed, and the availability of the model is checked before sending the request.

| Provider / API | Structured Response | Items to Handle Separately |
|---|---|---|
| OpenAI Responses | JSON Schema in `text.format` or SDK `responses.parse(text_format=...)` | refusal, incomplete, schema subset |
| OpenAI Chat Completions | `response_format` | Different from Responses in request/response shape |
| Anthropic Messages | `output_config.format` | stop reason, refusal, max tokens, supported schema constraints |

Anthropic's assistant prefilling does not guarantee schema and cannot be used with JSON structured outputs. The old `output_format` beta examples are not directly applicable to the new API. Strict tool input is a separate feature from the structured final answer, and tool calls are covered in [[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool_Use_and_Function_Calling]].

## OpenAI Responses Examples

This is an example API for explanation based on Python 3.12, `openai==2.54.0`, `pydantic==2.14.2`. An `OPENAI_API_KEY` and an `OPENAI_MODEL` that supports Structured Outputs are required. The SDK objects and response branches were verified with mocks, and actual API calls were not executed.

```python
import os
from typing import Literal
from openai import OpenAI
from pydantic import BaseModel, ConfigDict

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    summary: str
    sentiment: Literal["positive", "negative", "neutral"]

# transport errors and SDK validation exceptions are handled separately at the call boundary
client = OpenAI()
response = client.responses.parse(
    model=os.environ["OPENAI_MODEL"],
    input="Summarize and classify: The product works well.",
    text_format=AnalysisResult,
)

def read_analysis(response):
    if response.status != "completed":
        raise RuntimeError("Response did not complete")
    for item in response.output:
        if item.type == "message":
            for part in item.content:
                if part.type == "refusal":
                    raise ValueError("Model refused the request")
    if response.output_parsed is None:
        raise ValueError("No validated output")
    return response.output_parsed

result = read_analysis(response)
```

Refusal can appear instead of the expected schema. Truncated outputs are not treated as valid JSON by regular expressions. 400 errors caused by unsupported schemas require modifying the schema and will not be resolved by repeating the same request.

## Local Validation Example

This example can be run without external APIs from `pydantic==2.14.2`. It checks if the input `rating` is an integer between 1 and 5, and outputs `5` for valid input and `rejected` for out-of-range input. This validation does not check if the rating matches the value of the original review.

```python
from pydantic import BaseModel, ConfigDict, Field, ValidationError

class ProductReview(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    product_name: str
    rating: int = Field(ge=1, le=5)

review = ProductReview.model_validate_json('{"product_name":"Keyboard","rating":5}')
print(review.rating)
try:
    ProductReview.model_validate_json('{"product_name":"Keyboard","rating":8}')
except ValidationError:
    print("rejected")
```

Pydantic's local validator does not directly correspond to the JSON Schema subset of the provider. Application validation is performed even after server-side constrained generation. Even when using YAML, a safe parser and explicit schema are used, and the generated configuration is not run without validation.

## Failure Handling and Retry

| Failure | Handling Principle |
|---|---|
| Refusal | Returned as a separate state; not hidden by schema errors or retried unconditionally |
| Incomplete / token limit | Check the cause and budget; do not treat partial JSON as the final result |
| Unsupported schema / parameter | Correct schema, SDK, or model compatibility |
| 429 / Temporary network error | Limited retry, backoff, and deadline; track costs |
| Local validation failure | Limit the error type for repair or user confirmation; limit total retry count |
| Schema is correct but facts are wrong | Cross-reference source and verify business rules; do not solve with format retries alone |

During streaming, an incomplete object is not finalized as the final result. Wrappers like Instructor simplify validation and retry, but they do not eliminate the responsibility for provider support scope or factual verification.

## Selection Criteria and Boundaries

If the program consumes the extraction/classification results, it specifies a schema. We do not excessively constrain tasks that only require natural language descriptions into a schema. We design expressions for cases where fields are missing or evidence is insufficient, and evaluate whether facts are fabricated to fill the schema.

Tool Use is a **request for execution**, and Structured Output is an **output contract**. Even if the argument schema is passed, permission verification, approval, and idempotency are the responsibility of the execution application. The calibration of classification scores refers to [[en/AI/Engineering/Model_Engineering/Model_Types/Decision_Models|Decision_Models]].

## Role in AI Engineering

Structured output clarifies the interface between model results and software. A reliable data flow requires designing schema validation, semantic validation, and failure state handling together.

## Related Concepts
[[en/AI/Engineering/Flow_Engineering/Linear_Flow/Tool_Use_and_Function_Calling|Tool Use & Function Calling]] · [[en/AI/Engineering/Prompt_Engineering/Sampling_Controls|Sampling Controls]] · [[en/AI/Engineering/Harness_Engineering/Harness_Safety/Guardrail_Engineering|Guardrail Engineering]] · [[en/AI/Engineering/Model_Engineering/Model_Types/Decision_Models|Decision Models]]

## Sources
- OpenAI, [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- Anthropic, [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- Pydantic, [Models](https://docs.pydantic.dev/latest/concepts/models/)
- Instructor, [Documentation](https://python.useinstructor.com)
