# How To Tell If An AI Tool Actually Works (Before You Trust It)

Last reviewed: 2026-06-22

A plain-English guide for FEC supervisors and managers. A vendor demo always looks
impressive. A pilot always sounds promising. This guide helps you decide whether an
AI tool is good enough for your task — using your own judgment and a simple test you
can run yourself, before you rely on it for real work.

## What This Is

- A practical method for checking AI tools, vendor claims, and pilots.
- A short checklist you can run with a vendor or a pilot team.
- Written for busy managers. No coding required.

## What This Is Not

- A technical benchmark manual.
- A replacement for IT, security, or legal review.
- Permission to test with real customer or employee data. Use synthetic or approved
  data only (see [Safe Data Rules](#safe-data-rules)).

## The Short Version

1. Decide what "good" means for your task **before** you look at any tool.
2. Build a fair test that is **hard enough** to separate a good tool from a great one.
3. When a result surprises you, suspect the **test** before you trust the score.
4. **Measure, don't assume** — including your own gut and the vendor's claims.
5. Run the [checklist](#the-manager-checklist) with the vendor or pilot team.

The rest of this guide explains each step with examples.

---

## Step 1: Decide What "Good" Means First

Most AI evaluations go wrong before they start, because nobody wrote down what a good
result looks like. "Make our briefings better" is not something you can measure. So
define it first, in writing, for your specific task.

A useful definition of "good" answers:

- **What is the task?** ("Turn rough shift notes into a clean handoff brief.")
- **What does a great output look like?** Write or pick two or three real examples you
  would be happy to send.
- **What does a failing output look like?** ("Invents a delivery count," "drops the
  safety note," "wrong tone for a customer.")
- **What matters most?** Speed? Accuracy on numbers? Consistency? Tone? Rank them.
- **What is the bar?** "Right answer 9 times out of 10, no invented facts, under two
  minutes."

Write these down before you see a demo. If you decide what "good" means *after* the
vendor shows you their best example, you will simply describe their tool back to
yourself.

> **Tip:** Keep a small file of 10–20 real-but-scrubbed examples of the task, each with
> the answer you would accept. That file is your standard. You will reuse it for every
> tool you ever consider for this task.

---

## Step 2: Make A Fair Test That Is Hard Enough

A test only helps you if it can tell the difference between a good tool and a great
one. The most common mistake is making the test **too easy**.

### The "everything scores 90%" trap

If you run an easy test, every tool scores 90 to 100 percent and they all look the
same. That tells you nothing. It is like giving every driver a parking-lot test —
everyone passes, and you learn nothing about who can handle the highway.

A good test **spreads the scores out.** You want the weak option to clearly fail and
the strong option to clearly stand out. If two tools tie at the top, your test is
probably too soft — add harder cases until the differences show.

### What makes a test hard enough

- **Include the messy cases**, not just the clean ones: incomplete notes, unusual
  shifts, the exceptions your team actually hits, the edge that trips people up.
- **Mix in a few near-impossible cases** so the very best tool has somewhere to shine.
- **Use realistic inputs**, not tidied-up samples the vendor would love.
- **Keep the easy cases too** — you still want to confirm nobody fails the basics.

### Make it a fair test

- **Same inputs for every tool.** Same examples, same instructions, same conditions.
- **Score blind if you can.** Hide which tool produced which answer so you don't
  reward the brand you already like.
- **Use your standard from Step 1**, not whatever the tool happens to be good at.
- **Run it more than once.** AI tools can give different answers to the same question;
  one lucky run is not proof.

| Weak test | Strong test |
|-----------|-------------|
| A handful of clean, easy examples | A range from easy to genuinely hard, including messy real cases |
| Everything scores 90–100% | Scores spread out; weak and strong options separate clearly |
| Vendor picked the examples | You picked the examples, from real work |
| Scored once, by someone who knows the brand | Scored several times, blind to which tool is which |

---

## Step 3: Suspect The Test When Results Surprise You

Here is a lesson that has burned experienced teams: **the test itself can be the bug.**

In one real evaluation, the *best* tool scored close to zero — not because it gave bad
answers, but because the scoring missed the way that tool formatted its output. The
tool was excellent. The ruler was broken. Anyone who trusted that first score would
have thrown out the best option.

So treat any surprising result as a question, not an answer:

- **A tool scored shockingly low?** Read a few of its actual answers yourself before
  you believe the number. The answers may be fine and the scoring wrong.
- **A tool scored suspiciously high?** Same thing. Make sure it isn't gaming the test
  or matching a quirk of your examples instead of doing the real task.
- **All tools failed one case?** The case may be unfair, mislabeled, or impossible.
- **The numbers don't match what you saw in the demo?** One of them is wrong. Find out
  which before deciding.

The rule: **sanity-check surprising results before trusting them.** Open the actual
outputs and read them with your own eyes. Scores summarize; they also hide. A number
is only as good as the way it was measured.

---

## Step 4: Measure, Don't Assume

The whole point of testing is to replace guesses with evidence. Two kinds of guesses
deserve special suspicion.

### Don't trust the spec sheet

Vendor claims, marketing pages, and even a tool's own description of itself often do
**not** match what you measure. "Best in class," "99% accurate," and "outperforms the
competition" are claims, not results. They may be true for some other task, on some
other test, under conditions that don't match yours. The only number that matters is
the one you get on *your* task with *your* examples. Make them show you, then check it
yourself.

### Don't trust your gut (yet)

The team's instinct about which tool would win is often wrong until tested. The
familiar brand, the slickest demo, the one a colleague recommended — none of that
predicts how a tool does on your specific task. Run the test. Sometimes the
underdog wins. Be willing to be surprised, and let the evidence decide.

> **Plain rule:** A claim is a starting point for a test, never a substitute for one.

---

## Step 5: A Note On Where AI Can Run

You may hear that an AI tool can run "in the cloud" (on a vendor's servers, usually
paid per use) or "on your own equipment" (private, no per-use fee). Both can work. The
trade-off is real and worth understanding at a high level, because it affects cost,
speed, and privacy:

- **Running privately** keeps data in-house and avoids per-use fees, but a capable tool
  needs capable equipment. If the tool is too big for the machine, it runs slowly — or
  not at all.
- **Bigger is not automatically better.** A larger, more powerful tool needs more
  memory and can be slower. Some tool designs handle a tight equipment budget far
  better than others.
- **This is a cost / speed / privacy decision, not a "buy the biggest" decision.** The
  right answer depends on your task, your budget, and your data sensitivity — which is
  exactly why you test on *your* task instead of chasing the most impressive spec.

If a vendor or pilot proposes private hosting, ask what equipment it needs, how fast it
runs on that equipment, and what happens to speed and cost as usage grows. (More detail
in the [technical appendix](#for-the-technically-curious).)

---

## The Manager Checklist

Run this with any vendor, pilot team, or tool you are considering. If you cannot get a
clear answer to a question, treat that as a warning sign.

### Before the test

- [ ] We wrote down what "good" looks like for **our** task, before seeing any demo.
- [ ] We have 10–20 real-but-scrubbed examples with the answers we would accept.
- [ ] Our test includes hard and messy cases, not just clean ones.
- [ ] We confirmed the test uses only synthetic or approved data.

### During the test

- [ ] Every tool gets the **same** inputs and instructions.
- [ ] We are scoring against **our** standard, not the vendor's.
- [ ] We ran each test more than once.
- [ ] Scoring is blind to which tool is which, where possible.

### Reading the results

- [ ] The scores **spread out** (if everything ties, the test is too easy).
- [ ] We read the actual outputs, not just the scores.
- [ ] We investigated every surprising result before believing it.
- [ ] We checked vendor claims against what we actually measured.

### Before deciding

- [ ] We know the real cost (per use, per month, or equipment) at our expected volume.
- [ ] We know how fast it runs under realistic load.
- [ ] We know where our data goes and who can see it (IT / security signed off).
- [ ] A human reviews every output before it is sent or acted on.
- [ ] We wrote down the stop condition: when would we walk away from this tool?

---

## Safe Data Rules

Everything in this guide assumes you are testing with **synthetic or approved
non-sensitive data only.** Never test an AI tool with:

- Customer names, addresses, phone numbers, signatures, or photos
- Real tracking numbers or package details
- Route manifests or facility security details
- Employee records or performance data
- Pricing, contract terms, or bid information
- Passwords, API keys, or credentials

A tool that "works" is worthless if testing it leaked data. Bring IT and security in
before any tool touches real information.

## How This Connects To A Pilot

This guide is how you decide a tool is worth a pilot, and how you judge the pilot once
it runs. When you are ready to propose one, use the
[AI Pilot Program Template](pilot-program-template.md). Its success and failure
criteria are the same idea as deciding "what good means" here — written down before you
start, measured against evidence at the end.

---

## For The Technically Curious

This appendix adds detail for readers who want it. None of it is required to use the
guide above. It also explains the few technical terms that sit behind the plain-English
advice.

### "Spreading the scores out" has a name

When a test is too easy and everything scores near the top, that is a **ceiling
effect** — the test has hit its ceiling and can no longer separate options. A good
evaluation set is deliberately calibrated so that the score range is wide. If your best
and worst options are within a point or two of each other, add harder items until they
separate.

### The "best tool scored zero" failure

That failure is almost always a **harness bug** — a flaw in the measurement code, not
the tool. Common causes: the scorer expected one output format and the tool produced
another (e.g. it wrapped the answer in extra text, or used a different label), so an
exact-match check scored a correct answer as wrong. The lesson generalizes: validate
the measurement on a few known-good and known-bad cases first, so you know the ruler
works before you trust what it measures.

### Why bigger models can run slower or not at all

AI models are loaded into a computer's working memory to run. A larger, more capable
model needs more memory (on graphics hardware this is called **VRAM**). If a model does
not fit, the computer either runs it slowly by shuffling data in and out, or cannot run
it at all. This is why "buy the biggest model" is not a strategy: the right size is the
one that fits your equipment with acceptable speed.

Some model designs use a trick called **Mixture of Experts (MoE)**: only a fraction of
the model activates for any given request, so a large, capable model can run at the
speed and memory cost of a much smaller one. This is one reason two models with similar
"size on paper" can behave very differently on the same machine — and another reason to
measure on your own hardware instead of trusting the spec.

### Practical questions to ask a vendor about private hosting

- What hardware does this need to run at the speed you just demonstrated?
- How does speed and cost change as our usage grows (concurrent users, volume)?
- If we outgrow one machine, what is the upgrade path?
- What runs where — does any data leave our equipment, ever?

---

*Guide version: 2026-06-22. Aligns with the [Plain-English Documentation Standard](documentation-standard.md)
and the [Project Review Checklist](governance/project-review-checklist.md). Use synthetic
or approved non-sensitive data only; a human owner reviews every output.*
