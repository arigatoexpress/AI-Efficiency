# FedEx Terminology Quick Reference

A plain-English glossary for AI Efficiency team members who work across Express, Ground, and Freight operations. Use this to write prompts and documentation that sound authentic to FedEx operators.

## Operations

| Term | What It Means | AI Use Example |
|------|--------------|----------------|
| **Station** | A local facility where packages are sorted and loaded for delivery or pickup. Express and Ground both use stations. | Draft a station-level shift brief |
| **Sort Hub / Sortation Facility** | A larger facility where packages are sorted between destinations, often with automated conveyor systems. | Plan staffing for a sort hub twilight shift |
| **Hub-and-Spoke** | FedEx's network model: packages flow from origin stations to central hubs, then to destination stations. | Explain network delays in plain English |
| **P&D** | Pickup and Delivery — the local route operation that gets packages to and from customers. | Draft P&D route density briefs |
| **Linehaul** | Long-distance transport of packages between hubs, stations, and airports, usually by tractor-trailer. | Communicate feeder delays to stations |
| **Feeder** | A smaller tractor-trailer or straight truck used for linehaul, especially on shorter routes. | Plan feeder pickup windows |
| **Courier** | An Express employee who drives a delivery route. | Draft courier safety reminders |
| **ISP** | Independent Service Provider — a Ground contractor who owns routes and employs drivers. | Draft ISP coordination briefs |
| **Last Mile** | The final leg of delivery from station to customer door. | Identify last-mile bottleneck risks |
| **Cross-Dock** | Moving packages directly from an inbound trailer to an outbound trailer with minimal storage time. | Coordinate cross-dock timing |
| **DIM** | Dimension in Motion — automated package measurement and pricing verification. Used on 90%+ of Freight shipments. | Explain DIM benefits to contractors |
| **Peak Season** | The high-volume period roughly October through January, driven by holidays. | Draft peak season contingency plans |
| **Twilight Sort** | An evening sort shift, common in Ground hubs, that prepares packages for next-day P&D. | Plan twilight sort staffing |

## Network and Infrastructure

| Term | What It Means |
|------|--------------|
| **Memphis World Hub** | FedEx Express's primary global sorting facility. |
| **Indianapolis Hub** | Express's second national hub, being expanded and modernized. |
| **Regional Hub** | Major sorting facilities in Fort Worth, Newark, Oakland, Greensboro. |
| **1Network** | FedEx's initiative to combine Express and Ground operations into a single network. |
| **Purple Promise** | FedEx's customer service commitment: "I will make every FedEx experience outstanding." |
| **Safety Above All** | FedEx's #1 operating value. |

## Roles

> **Audience note — the standard term for this repo:** when a document
> addresses front-line operations leadership, use **"FEC supervisors and
> managers"** (singular: "FEC supervisor or manager"). Post-1Network,
> front-line leadership roles fall under FEC — drafted here as Front-line
> Engagement and Coordination (**TODO: confirm the official expansion of
> "FEC" before external use**). "Operations Manager" is the Legacy Express
> form of the role; it appears in this glossary for reference but should not
> be used as the default audience term in new documents.

| Term | What It Means |
|------|--------------|
| **FEC Supervisor** | Front-line supervisor of day-to-day facility operations, staffing, and safety under the unified 1Network structure. Champions "Safety Above All." Current titles include Operations Supervisor / FEC Supervisor. |
| **FEC Manager** | Manages a facility's FEC supervisors and the overall operation — the manager-level form of the front-line FEC leadership role. |
| **Operations Manager** | Legacy Express form of the role now under FEC. Oversees day-to-day facility operations, staffing, and safety. |
| **Senior Manager** | Oversees multiple FEC managers or a larger facility. |
| **Sort Manager** | Manages the sort operation specifically — belt flow, chute assignments, unload/load timing. |
| **P&D Manager** | Manages pickup and delivery operations — route planning, courier/ISP coordination, customer service. |
| **Linehaul Manager** | Manages feeder and long-haul operations — trailer scheduling, carrier coordination, dispatch. |
| **QA (Quality Assurance)** | Monitors package handling quality, misloads, damage, and service failures. |

## Metrics and Concepts

| Term | What It Means | Note for AI Use |
|------|--------------|-----------------|
| **TLH (Total Labor Hours)** | The total labor hours a facility or operation uses in a period — the hours side of productivity. | Use facility/shift aggregates only — never individual employee hours |
| **SPH (Shipments/Stops Per Hour)** | Throughput per labor hour (volume ÷ TLH) — the productivity side. Efficiency goals typically compare SPH to an engineered goal. | Use aggregates, never individual employee performance data |
| **On-Time Performance** | Percentage of packages delivered within the committed service window. | Use general trends, not real numbers |
| **Service Failure** | A package that missed its committed delivery time. | General discussion only |
| **Misload** | A package loaded onto the wrong trailer or vehicle. | General process improvement |
| **Damage Rate** | Percentage of packages damaged in handling. | General trends only |
| **Cube Utilization** | How efficiently trailer space is used. DIM improves this. | Public data only |
| **Operating Ratio** | Operating expenses as a percentage of revenue. Lower is better. | Public financial data only |

## Data and Technology

| Term | What It Means |
|------|--------------|
| **FedEx Dataworks** | FedEx's insights and intelligence platform. Generates analytics from the 2PB+ of daily network data. |
| **COSMOS** | FedEx's legacy customer operations service master online system. (Being modernized.) |
| **FedEx Ship Manager** | Web-based shipping application for business customers. |
| **SenseAware** | FedEx's sensor-based monitoring service for high-value shipments. |

## Safety and Compliance

| Term | What It Means |
|------|--------------|
| **OSHA** | Occupational Safety and Health Administration. Federal workplace safety regulator. |
| **DOT** | Department of Transportation. Regulates commercial vehicle operations. |
| **CSA Score** | Compliance, Safety, Accountability score — DOT safety rating for carriers. |
| **Near-Miss** | An incident that could have caused injury or damage but did not. |
| **PPE** | Personal Protective Equipment — gloves, safety glasses, steel-toe boots, etc. |
| **Three Points of Contact** | Safety rule when entering/exiting vehicles or equipment: always have three limbs in contact. |

## Using This Reference

When writing prompts or documentation:
1. Use the correct term for the operation you are describing.
2. Do not invent FedEx-specific acronyms or systems.
3. If you are unsure whether a term is public knowledge, describe it in plain English instead.
4. Never include internal system names, codes, or procedures that are not publicly documented.

## Sources

- FedEx Corporation Annual Reports and SEC filings (public)
- FedEx Newsroom and press releases (public)
- FedEx Careers website (public)
- FedEx B2B Trends Report 2026 (public)
