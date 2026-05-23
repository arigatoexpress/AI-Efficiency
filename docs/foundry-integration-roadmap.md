# Foundry Integration Roadmap

Last reviewed: 2026-05-23

The logistics intelligence app should produce Foundry-ready data packages before
it attempts a live Foundry deployment. That keeps the work testable, reviewable,
and safe while access and governance are still being confirmed.

## Current Pattern To Reuse

The regional intelligence repo already has a Foundry export pattern in:

```text
/Users/aribs/Code/regional-intel-workbench/app/services/foundry_export.py
```

That pattern exports NDJSON object files, computes hashes, records dropped rows,
and keeps provenance checks close to the export boundary. The logistics work
should follow the same shape.

Current implementation track:

- [regional-intel-workbench PR #22](https://github.com/arigatoexpress/regional-intel-workbench/pull/22)
  adds a public/synthetic logistics Foundry fixture export with deterministic
  NDJSON, manifest hashes, and provenance drop reporting.

## Candidate Ontology

| Object Type | Purpose |
| --- | --- |
| `Station` | Public or synthetic station profile used by the prototype. |
| `Region` | Mountain, corridor, or operating region. |
| `LogisticsDataSource` | Source owner, URL, rights, TTL, and output policy. |
| `LogisticsSignal` | Public event or metric such as weather alert, road issue, airport context, or freight baseline. |
| `RouteRiskEstimate` | Derived estimate that combines public signals with a synthetic route profile. |
| `ShiftReadinessBrief` | Manager-facing summary with risks, checks, and source trail. |
| `ForecastModelRun` | Model name, input window, output horizon, metrics, and limitations. |
| `GovernanceReview` | Review state, data classification, approvals, blockers, and owner. |

## Export Contract

Each export should include:

- `manifest.json`
- one NDJSON file per object type;
- stable object IDs;
- source URL and source owner where applicable;
- `data_classification` with allowed values such as `public`, `synthetic`, or
  `derived_public`;
- retrieval timestamp;
- row hash;
- file hash;
- dropped-row reasons.

Rows should be dropped when:

- a public signal lacks source name or source URL;
- data classification is missing or not allowed;
- a record claims internal FedEx truth in this public workflow;
- a record cannot be tied to a retrieval timestamp.

## Palantir Foundry Notes

Palantir's public docs describe [Python transforms](https://www.palantir.com/docs/foundry/transforms-python/)
as the most full-featured way to author data transformations in Foundry. Their
[Ontology overview](https://www.palantir.com/docs/foundry/ontology/overview/)
and [Ontology SDK overview](https://www.palantir.com/docs/foundry/ontology-sdk/overview/)
are the best starting references for object and application design.

This means the safest deployment path is:

1. Build deterministic object files locally.
2. Upload them as datasets in Foundry when access is approved.
3. Use Python transforms to normalize and validate fields.
4. Bind curated datasets to Ontology object types.
5. Add application views only after object security, retention, and review
   rules are known.

## Demo Boundary

The initial Foundry demo should use:

- public data;
- synthetic station data;
- derived public indicators;
- no internal FedEx data;
- no live operational actions.

## Verification Checklist

- Export is deterministic across repeated runs.
- Manifest includes hashes and drop counts.
- No row enters the packet without provenance.
- Source terms are documented in the source catalog.
- Object names do not imply official production status.
- The packet can be reviewed outside Foundry before upload.

## Open Questions For IT And Governance

- Which Foundry environment should receive prototype datasets?
- Are public web sources allowed to be ingested directly into Foundry?
- Should adapters run outside Foundry and publish NDJSON, or run as Foundry
  transforms?
- What data markings are required for public, synthetic, derived, and restricted
  data?
- Who approves Ontology object types and action types?
- What retention and logging rules apply to manager-generated briefs?
