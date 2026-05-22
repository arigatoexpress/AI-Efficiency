# OSINT Data Map

This app should use public information to support manager awareness. It should
not infer private FedEx operations from public data.

## Source Rules

- Use public sources only.
- Show the source link next to each claim.
- Label every synthetic number as synthetic.
- Treat public data as context, not as a command.
- Require human verification before a manager changes a real plan.

## Recommended Sources

| Source | Use In The App | Notes |
| --- | --- | --- |
| [National Weather Service API](https://www.weather.gov/documentation/services-web-api) | Forecasts, alerts, and observations. | NWS says the API provides forecasts, alerts, observations, and related weather data. It requires a user agent and has reasonable rate limits. |
| [Open-Meteo weather API](https://open-meteo.com/en/docs) | Current and forecast weather for public coordinates. | Good for fast prototypes because many endpoints do not require an API key. Check license and rate limits before production use. |
| [USGS earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/) | Regional seismic events and landslide-awareness context. | Use as regional awareness only. Do not imply station structural impact from earthquake data alone. |
| [COtrip](https://www.cotrip.org/) | Colorado public road conditions, alerts, chain laws, cameras, and route context. | A [Colorado General Assembly road-conditions note](https://leg.colorado.gov/content/road-conditions) says CDOT maintains COtrip for travel alerts, route info, road conditions, road work, snowplows, and chain laws. |
| [FedEx Gunnison public location page](https://local.fedex.com/en-us/co/gunnison/47126) | Public location context only. | This page identifies a FedEx Authorized ShipCenter at 125 W Virginia Ave. Do not call it an internal station unless FedEx confirms that classification. |
| [Gunnison-Crested Butte Regional Airport](https://gunnisoncounty.org/703/Airfield-Details) | Public airport and weather context near Gunnison. | Gunnison County publishes public airport details, runway information, and AWOS access notes. |

## Useful Public Signals

| Signal | Manager Question |
| --- | --- |
| Wind gusts above local threshold | Do we need to verify yard, ramp, or trailer-handling risk? |
| Snow or ice forecast | Do we need a staffing, staging, or safety huddle check? |
| Public road restriction | Do we need to verify linehaul timing with approved internal systems? |
| Active NWS alert | Should this be included in the shift brief? |
| Regional seismic event | Does local leadership need to verify building, road, or airport status? |
| Airport weather or runway context | Does feeder planning need a human verification step? |

## Do Not Infer

Do not infer:

- exact package impact;
- customer impact;
- route commitments;
- employee availability;
- internal station throughput;
- dispatch instructions;
- safety decisions;
- official FedEx policy.

## Source Confidence Labels

Use these labels in the UI:

- Public fact: directly from a linked public source.
- Model forecast: forecast or weather model output.
- Synthetic demo data: made-up value for prototype display.
- Manager note: entered by a human user.
- Needs internal verification: cannot be confirmed from public data.

## Best Manager Summary Format

```text
Public signal:
[what the public source says]

Possible station relevance:
[plain-English interpretation]

Do not assume:
[what the app cannot know]

Verify with:
[approved internal system or human owner]
```
