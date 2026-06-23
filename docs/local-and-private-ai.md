# Private, On-Site AI: When It Makes Sense

Last reviewed: 2026-06-22

## What This Is

A plain-English guide for FEC supervisors and managers to one option for running
AI: **on your own hardware, where the data never leaves the building**. Most AI
people use today runs in the cloud — you type, your words travel to a vendor's
servers, the answer comes back. On-site AI flips that: the model runs on a
computer you control, so the information you put in stays on that computer.

The one-sentence version: **cloud AI rents someone else's computer; on-site AI
uses your own.** Both can be useful. This guide helps you tell which one fits a
given task, and warns you about the honest tradeoffs before anyone spends money.

## Who It Helps

- Managers weighing whether sensitive or high-volume work could run privately.
- Anyone who hears "you can run AI without the cloud" and wants to know the
  catch before getting excited.
- Reviewers deciding whether an on-site idea is worth a small, measured pilot.

## Safe Data Rules (Read These First)

- **This guide is about a capability, not a permission.** Choosing on-site AI
  does not by itself approve any real FedEx data. The same boundaries apply.
- **Public or synthetic data only** in this repo, on-site or cloud, until FedEx
  IT and AI governance approve a separate, secured environment with a named
  owner.
- **A human reviews every output**, no matter where the model ran. "It ran on
  our own box" is not a substitute for fact-checking.
- **On-site is not automatically compliant.** Keeping data in the building helps
  with privacy, but a real deployment still needs IT, security, and governance
  sign-off. Do not treat "it's local" as a shortcut past review.

## Why A Manager Would Care

Three reasons on-site AI comes up:

| Reason | What it means in practice |
|--------|----------------------------|
| **Privacy** | The information you type in never leaves the machine. Nothing is sent to an outside vendor, so there is no third-party copy to worry about. |
| **No per-use fees** | Cloud AI usually charges per use. An on-site model, once the hardware is bought, has no per-question bill — you can use it as much as the hardware allows. |
| **Works offline** | It keeps running with no internet. Useful for a back room, a remote site, or anywhere a dependable connection is not guaranteed. |

None of these is free. The cost moves from a monthly bill to up-front hardware,
and from "the vendor handles it" to "someone here maintains it." That is the
core of the decision below.

## The Honest Tradeoffs

On-site AI is a real option, not a magic one. Be clear-eyed about these.

### Capability Versus Hardware

The most capable models are large, and large models need a lot of memory and a
strong processor to run well. A cloud vendor owns warehouses of that hardware,
so you rent top-tier capability by the question. On a single on-site machine you
get what that one machine can hold — which can be very useful, but is a
different ceiling.

### Bigger Is Not Always The Answer

It is tempting to assume "buy the biggest model and the biggest machine." Two
things push back on that:

- **A model that does not fit runs badly.** If a model is too large for the
  machine's memory, it either will not run or crawls — slow enough to be
  frustrating for everyday work.
- **Some designs handle small hardware far better than others.** Two models can
  be similar on paper, yet one stays fast on a modest machine while the other
  bogs down. The smart buy is often a well-chosen mid-size model that fits
  comfortably, not the largest one you can cram in.

So the real choice is a **balance of capability, speed, privacy, and cost** —
not a race to the biggest number.

### Measure, Do Not Assume

This one is learned the hard way, and it is worth stating plainly: **test before
you trust.**

- **An easy test tells you nothing.** If you compare options on a task so simple
  that everything scores near the top, you have learned nothing about which is
  better — they all look the same. A useful comparison has to be hard enough
  that the results actually spread apart.
- **Your measuring tool can be the bug.** In real testing, the *best* option
  once scored near zero — not because it was bad, but because of how the test
  read its answers. A surprising result is a reason to double-check the test
  itself before you believe it. Always sanity-check a result that seems too good
  or too bad to be true.
- **Specs and marketing are not measurements.** What a vendor claims, and even
  what a model says about itself, did not always match what testing showed. The
  team's gut was sometimes wrong until they actually ran the comparison. Decide
  on what you measured on your own tasks, not on the brochure.

This is the same discipline as the rest of this repo: a draft is unverified
until a person checks it. A tool is unproven until you have tested it on the
work you actually do.

## A Simple Decision Aid: Cloud Versus On-Site

Use this as a starting conversation, not a final ruling. IT, security, and
governance make the call on anything involving real data.

| If the task is... | Lean toward | Why |
|-------------------|-------------|-----|
| Low sensitivity, occasional use | **Cloud** | No hardware to buy or maintain; you only pay when you use it. |
| High sensitivity, must stay in-house | **On-site** | The data never leaves the machine. (Still needs governance sign-off.) |
| High volume, used constantly | **On-site (worth pricing out)** | Per-use cloud fees add up; owned hardware can be cheaper at scale. |
| Needs the most capable model available | **Cloud** | The largest, strongest models are easiest to access in the cloud. |
| Must work with no reliable internet | **On-site** | Keeps running offline. |
| Just getting started / proving value | **Cloud** | Lower commitment; learn what you need before buying hardware. |

### Three Questions That Usually Decide It

1. **How sensitive is the data?** The more sensitive, the more on-site appeals —
   but the more governance review it needs, too.
2. **How much will you use it?** Light use favors pay-as-you-go cloud. Heavy,
   steady use is where owned hardware can pay for itself.
3. **Who will maintain it?** Cloud shifts upkeep to the vendor. On-site means
   someone here owns updates, fixes, and security. No owner, no on-site.

If you cannot answer all three, it is too early to buy anything. Run a small
cloud pilot first and learn.

## Do Not Use It For

- Justifying real FedEx data on a local machine because "it never leaves the
  building." Privacy by location is not the same as approval; the data
  boundaries in this repo do not move.
- Buying the biggest hardware before testing whether a smaller, cheaper setup
  does the job.
- Trusting any AI output — cloud or on-site — without a human checking it.
- Treating "we ran our own benchmark" as final without sanity-checking the test
  itself.

## How To Start

1. Pick one real, low-sensitivity task you already use AI for.
2. Run the three decision questions above on it.
3. If on-site looks plausible, write it up with the
   [pilot program template](pilot-program-template.md): name an owner, a small
   test on synthetic data, a clear success measure, and a stop condition.
4. Before deciding, **test the options on your own task** — and double-check any
   surprising result before you trust it.

## Review And Approval

Aligned with the
[project review checklist](governance/project-review-checklist.md) and the
[AI use policy](governance/ai-use-policy.md). Any on-site deployment that would
touch real data is a governance event: it needs a documented owner, IT and
security review, and a sign-off path before it runs.

## Status

Reference guide. On-site AI is presented as an option to evaluate on public or
synthetic data, not an approved deployment. Real-data use stays out of scope
until formal approval exists.

---

## Appendix: For The Technically Curious

This section adds detail for readers who want it. Skip it freely — the guidance
above stands on its own.

### Why model size maps to memory

A model's "size" is usually given as a parameter count (for example, a "7B" or
"14B" model — billions of parameters). Those parameters have to be held in fast
memory to run quickly. On a typical AI workstation that fast memory is the
graphics card's VRAM; on some newer machines it is shared system memory. The
rough rule: a model needs to fit in available memory, with headroom for the
working context, or it spills over and slows dramatically.

This is why "buy the biggest" backfires. A model that overflows the machine's
memory gets swapped piece by piece, and speed collapses. A right-sized model
that fits leaves room for a longer working context and stays responsive.

### Why some designs fit small hardware better

Not all models of the same nominal size cost the same to run. A few design
choices change the picture:

- **Quantization** — storing the parameters at lower precision so the model
  takes less memory, usually with only a small quality cost. This is often what
  makes a capable model fit on a single machine at all.
- **Mixture-of-experts (MoE)** — a design where only part of the model is active
  for any given question, so it can be "large" in total knowledge while running
  more like a smaller model. These can punch above their weight on modest
  hardware.
- **Context window** — how much text the model can consider at once also consumes
  memory. A bigger context window is not free; it competes with the model itself
  for the same memory budget.

The practical upshot for a buyer: two "14B" models are not interchangeable, and
the spec sheet alone will not tell you which one runs well on your hardware. You
have to try them.

### Why benchmarks need care

A benchmark is only useful if it can tell *good* from *great*. Two common traps:

- **Ceiling effect** — if the test is easy, every option scores 90–100% and the
  scores all bunch at the top. You cannot rank options you cannot separate. A
  good test is hard enough that the results spread out.
- **Harness bugs** — the scoring code that reads each answer can itself be wrong.
  A real example: a strong model once scored near zero because the harness
  mis-read its output format, not because the model failed. The fix is to treat
  any shocking result as suspect until you have confirmed the test is measuring
  what you think it is.

The takeaway is the same at every level of detail: **measure on your own tasks,
make the test hard enough to be informative, and verify a surprising number
before you act on it.**

### Where this connects in the repo

- [Forecasting model license review](forecasting-model-license-review.md) — the
  same "check the license and reproduce the result before trusting it"
  discipline, applied to forecasting models.
- [Agentic AI for operations](technology/agentic-ai-for-operations.md) — the
  agency ladder, for when an on-site model is asked to take steps, not just
  answer.
- [Data source catalog](data-source-catalog.md) — the public/synthetic data
  rules any on-site pilot would also follow.
