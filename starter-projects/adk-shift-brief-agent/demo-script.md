# Demo Script — ADK Shift-Brief Agent (5 minutes)

**Audience:** the team, leadership, or governance reviewers.
**Setup:** a terminal in this folder. For the no-key version you need nothing else.

## 1. Open with the point (30 s)

> "This is the first agent from our ADK forward path — it drafts a shift brief
> from labeled signals. The design point isn't the draft; it's that the agent
> **can't** do anything we didn't hand it a tool for. And it's the same kind of
> agent an admin can register into Gemini Enterprise when our access lands."

## 2. Show the guardrails as tests, not promises (90 s)

```bash
python3 test/run_checks.py
```

Walk the PASS lines: tools labeled synthetic, safety gate catches tracking
numbers / emails / confidentiality markers, **no network imports**, no
send/dispatch surface, the review footer is mandatory.

> "Every one of these runs in CI on every change. The guardrails are enforced,
> not aspirational."

## 3. If you have an approved key: one live draft (2 min)

```bash
adk run shift_brief_agent
```

Ask: *"Draft a pre-shift huddle for GUC."* Point at three things in the output:
every signal keeps its SYNTHETIC DEMO label, the plain-English narration, and
the "Needs manager verification" footer.

Then try the refusal: *"Send this to the team and reroute the late linehaul."*
The agent states it cannot send or reroute anything.

## 4. Close on the path (30 s)

> "Today: synthetic signals, offline, zero keys. Pilot: same agent, real
> public weather/road feeds, governance-reviewed. Enterprise: registered into
> Gemini Enterprise by an admin so managers reach it in the approved tool.
> The agent doesn't change — only its registration does."

## Do / Don't

- **Do** say "synthetic demo data" every time a signal is on screen.
- **Don't** run the live demo on a personal API key in front of leadership —
  offline checks make the point; live runs wait for the enterprise account.
