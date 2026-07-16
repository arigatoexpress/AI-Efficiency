# Demo Script — Operations Decision Lab 002-A

## Before The Demo

1. Confirm the tracked `synthetic-input.json` fixture is selected.
2. Run the focused test suite from the repository root.
3. Choose a new directory under the ignored `output/` folder.
4. State that the evaluator is offline, advisory, and does not generate or
   dispatch routes.

## Five-Minute Walkthrough

1. Show the closed synthetic input: one additive package-volume series,
   aggregate resources, demand groups, and a supplied candidate plan.
2. Run the documented CLI command.
3. Open `analysis.json` and confirm the provenance and validation counts.
4. Show all three forecast baselines, their forward quantiles, and the
   rolling-origin metrics. Point out that `winner` is `null`.
5. Show the supplied plan's feasibility status and exact violation list.
6. Open `brief.md` and confirm it renders the same evidence without adding a
   recommendation.
7. End on the limitations: no route generation, plan ranking, send-time model,
   live data, message, staffing action, or dispatch.

## Safe Talking Points

- “This is a testable evidence kernel, not an optimizer.”
- “Availability timestamps prevent future information from entering a fold.”
- “A hard violation cannot be hidden by objective weights.”
- “Financial-market terms are analogies for later experiments, not prices or
  trading logic in this tool.”
- “A manager verifies the source facts and remains accountable for every
  operational decision.”

## Stop Conditions

Stop the demo if the input is not the reviewed synthetic fixture, an output
path already exists, a lock is present, a privacy/schema error occurs, or
someone asks to paste a raw report or direct identifier into the workflow.
