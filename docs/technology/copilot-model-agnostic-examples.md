# Copilot Model-Agnostic Examples

Last reviewed: 2026-06-20

These snippets show how to use GitHub Copilot with OpenAI-compatible endpoints
so the coding side of the stack stays model-agnostic. They are for local
development and approved internal gateways only.

> **Scope:** these examples are about *GitHub Copilot* (code assistant in VS Code
> and the terminal), not Microsoft 365 Copilot in Outlook/Teams, which runs on
> Microsoft's managed models. Do not redirect work-managed Microsoft 365 Copilot
> clients to local endpoints.

---

## GitHub Copilot CLI with a local Ollama endpoint

GitHub Copilot CLI supports **bring-your-own-key (BYOK)** providers that speak
the OpenAI Chat Completions API. This works with Ollama, vLLM, Azure OpenAI,
and other OpenAI-compatible gateways.

### Requirements

- Copilot CLI installed.
- A model that supports **tool calling** and **streaming**.
- A model with at least a 128K context window is recommended.

### Environment variables

```bash
# Ollama's OpenAI-compatible endpoint
export COPILOT_PROVIDER_BASE_URL="http://localhost:11434/v1"
export COPILOT_PROVIDER_TYPE="openai"        # openai | azure | anthropic
export COPILOT_PROVIDER_API_KEY="unused"     # Ollama ignores this by default
export COPILOT_MODEL="qwen2.5-coder:14b"     # must support tool calling + streaming
```

### Run

```bash
copilot explain "what does this function do"
```

For more examples run:

```bash
copilot help providers
```

---

## VS Code Copilot Chat with an OAI Compatible provider

VS Code Copilot Chat can route chat requests to an OpenAI-compatible base URL.
Use this for local Ollama or an approved internal gateway.

### Quick UI path

1. Open Copilot Chat: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (macOS).
2. Click the model picker above the chat input.
3. Select **Manage Models...**
4. Choose **OAI Compatible**.
5. Enter the base URL, API key, and model ID.

### Settings path

Add a provider and model to VS Code settings:

```json
{
  "oaicopilot.baseUrl": "http://localhost:11434/v1",
  "oaicopilot.models": [
    {
      "id": "qwen2.5-coder:14b",
      "owned_by": "ollama",
      "apiMode": "ollama",
      "context_length": 128000,
      "max_tokens": 4096,
      "temperature": 0
    }
  ]
}
```

For Ollama the API key can be any non-empty string because Ollama does not
authenticate by default.

---

## Generic OpenAI-compatible client snippet

Any script or agent that speaks the OpenAI Chat Completions API can switch
between providers by changing the base URL and model name. This is the common
denominator that keeps the repo model-agnostic.

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.getenv("LLM_BASE_URL", "http://localhost:11434/v1"),
    api_key=os.getenv("LLM_API_KEY", "unused"),
)

response = client.chat.completions.create(
    model=os.getenv("LLM_MODEL", "qwen2.5-coder:14b"),
    messages=[{"role": "user", "content": "Summarize this function in one sentence."}],
    temperature=0,
)
print(response.choices[0].message.content)
```

Use environment variables for the provider so the same code runs against
Ollama, Azure OpenAI, OpenRouter, or any other OpenAI-compatible endpoint
without code changes.

---

## Governance reminders

- Do not use local/BYOK models for confidential FedEx code or data without
  IT/security review.
- Do not point work-managed Copilot clients at personal or unapproved endpoints.
- Keep a human review step for any code or output that will be committed,
  shared, or used in operational systems.

## References

- [GitHub Copilot CLI BYOK providers](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
- [GitHub Copilot supported AI models](https://docs.github.com/en/copilot/using-github-copilot/ai-models/supported-ai-models-in-copilot)
- [Ollama OpenAI compatibility](https://ollama.com/blog/openai-compatibility)
- [Microsoft 365 Copilot extensibility](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/)
