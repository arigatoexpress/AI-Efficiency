# Case Study: What A Small Team Learned Building And Testing A Private AI Setup

Last reviewed: 2026-06-22

## What This Is

A short, public-safe learnings log from a small team that built and rigorously
tested a private AI setup — AI that runs on one workstation the team controls,
instead of a paid cloud service. The specifics of the build are not the point.
The lessons are. Each one transfers to almost any AI pilot a FEC supervisor or
manager might run.

No client names, no real operational data, and no vendor endorsements appear
here. This is a story about how to test honestly, told so the next team can
skip the same mistakes.

## Who It Helps

- Anyone about to pilot an AI tool and asked to report whether it "works."
- Anyone comparing two tools and trying to pick fairly.
- Anyone who has to defend a recommendation to a leader who will ask, "How do
  you know?"

## The Four Lessons

### 1. A test only helps if it can tell good from great

The team's first test was too easy. Every tool scored between 90 and 100
percent. That felt like good news — until they realized a test where everyone
passes tells you nothing. You cannot rank tools that all look perfect, and you
cannot spot the one that is quietly better.

They made the test harder. Once the questions had real teeth, the scores spread
out, and the differences between tools finally became visible.

**The transferable lesson:** if your pilot scorecard shows everything passing,
the scorecard is probably too soft, not the tools too good. A useful test is one
that some options fail. Build in a few genuinely hard cases on purpose, so the
results have room to separate.

### 2. The thing doing the measuring can be the thing that is broken

At one point the team's best tool scored almost zero. That looked like a
disaster — until they checked. The tool was fine. The way the team's *measuring
script* read the answers was wrong, so it threw away correct results. The bug
was in the ruler, not the thing being measured.

**The transferable lesson:** when a result is shocking — the best option looks
terrible, or a weak option looks amazing — stop and sanity-check the measurement
before you trust it or report it. Read a few raw answers by hand. Surprising
numbers earn a second look, not a slide.

### 3. Measure, do not assume

More than once, the spec sheet, the vendor's claim, or even the tool's own
marketing did not match what the team actually measured. And the team's own gut
calls were sometimes wrong too, until they ran the test. The only reliable
source of truth was a real measurement on the team's own task.

**The transferable lesson:** treat every claim — a vendor's, a colleague's, your
own instinct — as a hypothesis to check, not a fact to repeat. "We measured it"
beats "the brochure says" and "I assumed" every time. This is the heart of an
honest pilot: you report what you saw, not what you expected.

### 4. Running AI privately is real — with a real tradeoff

The team confirmed something useful: you can run capable AI privately, on a
single workstation, with no cloud service and no per-use fees. Data stays on a
machine the team controls. For sensitive or regulated work, that privacy can
matter more than raw horsepower.

But it is not free of tradeoffs. Bigger, smarter AI models need more memory.
When a model is too big for the machine's memory, it either does not run or runs
slowly. Some model designs handle that limit far more gracefully than others.

**The transferable lesson:** "run it privately" is a real option, not a fantasy
— but it is a cost, speed, and privacy decision, not a "buy the biggest model"
decision. Match the model to the machine and to how fast the answer needs to
come back. The right size beats the biggest size.

## The One-Line Version Of Each

- A test everyone passes is not a test. Make it hard enough to separate.
- Check the ruler before you trust the result.
- Measure; do not assume — not even your own instinct.
- Private AI is real, with a memory-versus-speed tradeoff. Size to fit.

## Why This Matters For The AI Efficiency Program

Every pilot we run will eventually face the same question from a leader: *how do
you know it works?* These four habits are how you earn a credible answer:

- design a test that can actually fail;
- verify the measurement before believing the number;
- prefer measured results over claims and hunches;
- treat "private versus cloud" as a tradeoff you size deliberately.

This is exactly the lightweight, evidence-first posture the program already
asks for: define the use case, classify the data, keep a human reviewing the
output, and measure outcomes before scaling. None of it requires a data
science team — just the discipline to test honestly and double-check anything
that looks too good or too bad to be true.

## Safe Data Rules

This is a learnings note built from generalized, non-identifying lessons. It
contains no client data, no real operational data, and no confidential details.
Any team applying these lessons should still run pilots on public, synthetic, or
approved non-sensitive data only, with a human owner reviewing every output.

## For The Technically Curious (Optional)

This section is safe to skip. It restates the four lessons in more technical
terms for readers who want them.

- **Ceiling effect.** A benchmark where all candidates cluster near 100 percent
  has no discriminating power. Increase task difficulty (or add adversarial /
  edge cases) until score variance is meaningful, then rank.
- **Harness bugs.** A near-zero score for a strong model is more often a parsing
  or output-handling defect in the evaluation harness than a true capability
  gap. Manually inspect raw generations before trusting aggregate metrics; add a
  small set of known-answer smoke tests to the harness itself.
- **Empiricism over spec sheets.** Vendor benchmarks, model cards, and
  marketing rarely reflect performance on *your* task distribution. Re-measure
  on a representative local fixture; pin model and library versions so results
  are reproducible.
- **Local inference tradeoffs.** Running models on-device is bounded by memory
  (e.g., RAM or GPU VRAM). When a model exceeds available memory it must offload
  or run slower; quantization and architecture choices (some designs degrade far
  more gracefully under memory pressure than others) materially change the
  cost/latency/privacy balance. "Biggest model" is not the objective; "best fit
  for the hardware and latency budget" is.

## What To Add To ROADMAP.md (Suggestion Only)

Do not rewrite the roadmap from this note — these are three small additions to
consider during the next review:

- **A pilot evaluation standard.** A one-page "how to test an AI tool honestly"
  checklist (hard-enough test, verify the measurement, measure don't assume,
  human review) so every pilot reports evidence the same way.
- **A measurement sanity-check gate.** Add a standing rule that any surprising
  pilot result — best option looks bad, weak option looks great — must be
  hand-verified before it appears in a brief or slide.
- **A "private vs cloud" decision note.** A short, plain-English guide for
  weighing on-device/private AI against cloud AI by privacy need, speed need,
  and cost — framed as a deliberate tradeoff, not a default.
