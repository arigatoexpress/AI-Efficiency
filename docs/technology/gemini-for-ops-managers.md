# Gemini For Operations Managers

Gemini is Google's family of AI models and tools. For this team, Gemini is most
useful as a drafting, summarizing, reasoning, and prototyping assistant.

Official references:

- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [Google AI Studio quickstart](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart)
- [Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search)
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Safety settings](https://ai.google.dev/docs/safety_setting_gemini)

## What Gemini Is Good For

- Turning rough notes into clear updates.
- Summarizing long text.
- Drafting meeting agendas and action lists.
- Comparing options.
- Explaining technical topics in plain English.
- Generating training outlines.
- Creating first-pass reports from approved, non-sensitive material.

## What Gemini Should Not Do Alone

- Make final operational decisions.
- Decide discipline, staffing, safety, legal, or customer-impacting outcomes.
- Use confidential data unless the tool and workflow are approved for that data.
- Send messages without human review.
- Replace source-of-truth systems.

## Prompting Tips

Be specific:

```text
Bad: Make this better.
Good: Rewrite this shift update for a station manager. Keep it under 200 words,
list risks separately, and flag anything that needs confirmation.
```

Give the model a role:

```text
Act as a practical operations manager who values safety, clarity, and concise
handoffs.
```

Require uncertainty:

```text
If something is missing or uncertain, do not guess. Put it under "Needs
verification."
```

Ask for structure:

```text
Return a table with columns: Issue, Impact, Owner, Next Step, Due Date.
```

## Grounding and Sources

Gemini can use Google Search grounding in supported API flows to improve factual
answers and return citation metadata. Use grounding for current public
information, but still verify anything important before acting.

Use grounding for:

- public policy or regulation checks;
- vendor documentation;
- public weather or news context;
- public market or technology updates.

Do not use grounding as a substitute for internal source systems.

## Structured Output

Structured output means asking the AI to return a predictable format, such as a
checklist, JSON object, or table. This is useful when a team wants repeatable
inputs across many managers.

Good operations examples:

- incident summary with fixed fields;
- process improvement intake;
- training request form;
- risk register;
- daily manager brief.

## Safety Settings

Gemini includes safety settings and built-in protections. These settings help
filter harmful content, but they do not replace our data-handling rules,
manager review, or company governance.

## Suggested Team Practice

Use Gemini in three levels:

1. Personal productivity: approved, non-sensitive drafting and summarizing.
2. Team templates: reviewed prompts stored in this repo.
3. Pilots: documented tools with data classification, owners, and governance
   review.
