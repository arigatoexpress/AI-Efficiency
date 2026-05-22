# Prompt Engineering Basics

Prompt engineering means giving AI clear instructions.

You do not need to be technical. If you can explain what you want to a capable
assistant, you can write a useful prompt.

## The Plain-English Formula

Use:

```text
Goal:
Context:
Source:
Rules:
Output:
```

## What Each Part Means

Goal: what you want done.

Context: who it is for and why it matters.

Source: what information the AI should use.

Rules: what the AI should not do.

Output: the format you want back.

## Bad Prompt

```text
Summarize this.
```

Why it is weak:

- no audience;
- no length;
- no format;
- no review instruction;
- no warning against guessing.

## Better Prompt

```text
Goal: Summarize these scrubbed shift notes.
Context: The audience is an incoming operations manager.
Source: Use only the notes below.
Rules: Do not invent facts. Put missing details under "Needs verification."
Output: Return 5 bullets and then a table with Owner, Action, Due Date, Risk.

Notes:
[paste notes]
```

## The Six Prompt Moves

### 1. Give A Role

```text
Act as a practical operations manager.
```

### 2. Give A Clear Task

```text
Turn these notes into a shift handoff.
```

### 3. Give The Audience

```text
Write for a senior manager who needs the key points quickly.
```

### 4. Give Boundaries

```text
Use only the notes provided. Do not add new facts.
```

### 5. Ask For Uncertainty

```text
Create a section called "Needs verification."
```

### 6. Specify The Format

```text
Return a table with columns: Issue, Impact, Owner, Next Step.
```

## Use Follow-Up Prompts

Your first prompt does not have to be perfect. Use follow-ups:

```text
Make this shorter.
```

```text
Make the tone more professional.
```

```text
List anything that sounds like an unsupported claim.
```

```text
Rewrite it for a non-technical audience.
```

```text
Turn this into a checklist.
```

## Ask AI To Check Its Own Work

Useful prompt:

```text
Review your answer. Identify any assumptions, unsupported claims, missing
details, or items that require human verification.
```

## Prompt Template For Managers

```text
Act as a practical operations manager.

I need help with:
[task]

Audience:
[who will read or use this]

Source material:
[paste approved, non-sensitive notes]

Rules:
- Use only the source material.
- Do not invent facts.
- Keep it concise.
- Flag uncertainty.
- Do not include sensitive data.

Output format:
[bullets, table, email, checklist, one-page brief, etc.]
```

## Common Mistakes

- Asking vague questions.
- Pasting too much sensitive context.
- Forgetting to say who the audience is.
- Accepting the first answer without review.
- Letting AI make commitments.
- Asking AI to decide instead of helping prepare a decision.

## Best Practice

Tell AI what good looks like.

```text
A good answer is short, factual, manager-ready, and clear about what needs
verification.
```
