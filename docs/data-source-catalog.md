# Public Data Source Catalog

Last reviewed: 2026-05-23

This catalog lists sources that could support the logistics intelligence app and
Foundry-ready exports. It is not permission to scrape everything listed here.
Each adapter must keep source metadata, retrieval timestamps, rights notes,
freshness rules, output policy, caveats, and normalized record hashes.

## Source Rules

- Prefer official APIs, official downloads, and published documentation.
- Do not bypass login, paywalls, rate limits, robots controls, or access terms.
- Do not redistribute raw vendor data unless the terms clearly allow it.
- Keep derived analysis, links, summaries, and source metadata separate from raw
  restricted payloads.
- Label public-derived predictions as estimates.
- Never mix public signals with real package, customer, employee, route,
  facility-security, or pricing data in this public repo.

## Recommended First Sources

| Source | Owner | Use | Retrieval | Rights Notes | App Policy |
| --- | --- | --- | --- | --- | --- |
| [National Weather Service API](https://www.weather.gov/documentation/services-web-api) | NOAA/NWS | Forecasts, alerts, observations | REST JSON | U.S. government open data with reasonable rate limits | Store selected alert/forecast summaries with source links. |
| [Open-Meteo](https://open-meteo.com/en/docs) | Open-Meteo | Weather model forecasts, hourly risk factors | REST JSON/CSV | Commercial and non-commercial terms differ; verify plan | Use as secondary model context, not authoritative alerts. |
| [USGS Earthquake Catalog API](https://earthquake.usgs.gov/fdsnws/event/1/) | USGS | Seismic disruption context | REST query API | U.S. government/public-domain style source; cite USGS | Store event metadata and source URL. |
| [COtrip](https://www.cotrip.org/) | Colorado DOT | Road, pass, closure, and travel condition context | Official site or approved feeds | Use official pages/feeds; do not scrape aggressively | Link out or cache minimal public status only if permitted. |
| [FAA Data Portal](https://www.faa.gov/data) | FAA | Aviation datasets and API discovery | Portal/API key | Public data catalog; individual APIs may require keys | Use only documented public endpoints. |
| [FAA SWIM/SFDPS](https://www.faa.gov/air_traffic/technology/swim/sfdps) | FAA | Flight data services for authorized consumers | SWIM access | Authorized access through FAA portals; not open scraping | Treat as future approved-enterprise integration only. |
| [BTS airline data](https://www.transtats.bts.gov/Data_Elements.aspx?Data=3) | Bureau of Transportation Statistics | Historical air carrier trends | Official download/query | Public DOT data | Use for historical trend baselines, not live flight tracking. |
| [BTS Freight Analysis Framework](https://www.bts.gov/faf) | BTS/FHWA | Freight flow estimates by mode, zone, commodity | CSV/Access downloads | Public DOT datasets with recommended citations | Use for regional freight context and synthetic load baselines. |
| [FHWA NPMRDS](https://ops.fhwa.dot.gov/perf_measurement/) | FHWA | Highway travel-time performance | Access-controlled data program | Free access is typically for approved public agencies and partners | Treat as approved-access source, not public scrape. |
| [OpenSky Network](https://opensky-network.org/about/terms-of-use) | OpenSky Network | ADS-B research data | REST/API/downloads | Operational or commercial use requires written license | Research only unless written license exists. |
| [FlightAware AeroAPI](https://www.flightaware.com/commercial/aeroapi) | FlightAware | Flight status, history, alerts, predictions | Paid API | Tiered license and storage/distribution restrictions | Use only with approved paid license and no raw redistribution. |
| [ADS-B Exchange data](https://www.adsbexchange.com/data/) | ADS-B Exchange | ADS-B flight tracking feed | Commercial/API access | Verify terms before use | Do not integrate until license is reviewed. |

## Useful Public Context Sources

| Source | Use | Notes |
| --- | --- | --- |
| [OurAirports](https://ourairports.com/data/) | Airport reference data | Useful for airport metadata; verify license before embedding. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) | Roads and places | ODbL attribution and share-alike obligations matter. |
| [U.S. Census API](https://www.census.gov/data/developers.html) | Regional demographics and business context | Public, but avoid people-level profiling. |
| [FRED API](https://fred.stlouisfed.org/docs/api/fred/) | Economic indicators | Good for macro context; not station load truth. |
| [Hugging Face TimesFM models](https://huggingface.co/models?other=timesfm) | Time-series forecasting research | Check model card, license, and reproducibility before use. |
| [Amazon Chronos models](https://huggingface.co/amazon/chronos-2) | Time-series forecasting research | Check model card and dependency requirements before use. |
| [Zama Concrete ML](https://docs.zama.ai/concrete-ml/) | Encrypted inference research | Useful for privacy experiments, not a default app dependency. |

## Data Products We Can Safely Build First

| Product | Inputs | Output |
| --- | --- | --- |
| Shift public-risk brief | NWS, Open-Meteo, COtrip links, USGS, station profile | Plain-English risks, source links, verification checklist. |
| Route watch estimate | Road condition links, weather, synthetic route baseline | Estimated friction score with uncertainty label. |
| Airport-adjacent risk | NWS aviation weather, BTS history, public airport metadata | Public context for likely disruption, not flight status truth. |
| Freight pressure baseline | BTS FAF, synthetic station assumptions | Long-run regional freight context. |
| Forecast research fixture | Synthetic station volume plus public exogenous signals | Testable load-estimation sandbox. |

## Adapter Metadata Template

```yaml
source_id:
source_owner:
source_url:
retrieval_mode:
retrieved_at:
license_or_rights:
freshness_ttl:
output_policy:
caveats:
normalized_record_hash:
```

## Red Lines

- No scraping FedEx customer, package, employee, driver, route, pricing, or
  facility-security information.
- No private screenshots in GitHub.
- No vendor flight data in public raw files unless the license explicitly allows
  redistribution.
- No claims that a public signal proves a specific FedEx package, truck,
  flight, or route is affected.
