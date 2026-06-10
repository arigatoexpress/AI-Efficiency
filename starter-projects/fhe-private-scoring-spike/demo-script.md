# Demo Script — FHE Private Scoring Spike

A ~3-minute walkthrough for a technical or governance audience. Everything shown is synthetic.

## Setup (20 sec)
Have `benchmark.py` output on screen (or run it live; it finishes in under a minute). Open with the question: *"Could a service score an idea submission without ever being able to read it? That's what fully homomorphic encryption claims. We measured it instead of speculating."*

## 1. The mechanics (60 sec)
- *"Six intake-form numbers, 600 synthetic submissions, a plain logistic-regression triage model — deliberately boring, because the question is the encryption, not the model."*
- *"Concrete ML takes the same model, quantizes it to 8 bits, and compiles it to a circuit that computes on ciphertext. The service sees encrypted bytes in, produces encrypted bytes out; only the submitter's key can read either."*

## 2. The numbers (60 sec)
- *"Accuracy: 86.1% clear, 85.6% encrypted — half a point, and it's the quantization, not the encryption: the encrypted run matched the simulation exactly."*
- *"Latency: 5.3 milliseconds per encrypted submission on a 4-core CPU. Yes, that's thousands of times slower than the clear model — and completely irrelevant for a workflow that scores a handful of submissions a day."*

## 3. The honest boundary (40 sec)
- *"What it protects: the contents, from the service itself. What it doesn't: who submitted, when, how often; the model; the result after decryption. It complements access control and audit — it replaces nothing."*
- Close: *"Recommendation stands: research track. If a real private-scoring need shows up, performance is already proven not to be the blocker — key management and governance would be the work."*

## Do / Don't
- **Do** say "synthetic data, research benchmark" every time the numbers come up.
- **Don't** let anyone leave thinking something in production is FHE-protected today.
