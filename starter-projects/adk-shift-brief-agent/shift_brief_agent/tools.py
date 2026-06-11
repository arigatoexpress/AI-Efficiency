"""Read-only tools for the shift-brief agent.

These tools are the agent's entire control surface: they can look up
clearly-labeled synthetic public signals, run a data-safety check, and
format a draft brief. There is deliberately no tool that writes, sends,
dispatches, or touches any internal system — and no network access at all
(the synthetic signals ship in `sample_signals.json`). In a governed pilot,
the two lookup tools would be re-pointed at the same public NWS / DOT feeds
the logistics intelligence app already uses.
"""

import json
import re
from pathlib import Path

REVIEW_FOOTER = "Needs manager verification — AI draft from labeled public/synthetic signals only."

BRIEF_TYPES = ("pre-shift huddle", "shift handoff", "after-action")

_SIGNALS_PATH = Path(__file__).parent / "sample_signals.json"


def _load_signals() -> dict:
    return json.loads(_SIGNALS_PATH.read_text())


def list_stations() -> dict:
    """List the demo station codes this agent knows and what they represent."""
    data = _load_signals()
    return {
        "data_label": data["_label"],
        "stations": {code: s["name"] for code, s in data["stations"].items()},
    }


def get_public_weather(station: str) -> dict:
    """Get labeled public-weather signals for a station code (e.g. 'MEM').

    Returns synthetic demo signals; every entry carries its own source label.
    """
    data = _load_signals()
    entry = data["stations"].get(station.strip().upper())
    if entry is None:
        return {
            "error": f"Unknown station '{station}'. Known demo stations: "
                     + ", ".join(sorted(data["stations"]))
        }
    return {"station": entry["name"], "data_label": data["_label"], "signals": entry["weather"]}


def get_public_road_context(station: str) -> dict:
    """Get labeled public road/traffic signals for a station code (e.g. 'MEM').

    Returns synthetic demo signals; every entry carries its own source label.
    """
    data = _load_signals()
    entry = data["stations"].get(station.strip().upper())
    if entry is None:
        return {
            "error": f"Unknown station '{station}'. Known demo stations: "
                     + ", ".join(sorted(data["stations"]))
        }
    return {"station": entry["name"], "data_label": data["_label"], "signals": entry["road"]}


def check_data_safety(text: str) -> dict:
    """Heuristic pre-send check for content that should never enter an AI tool.

    Flags likely tracking numbers, emails, phone numbers, and confidentiality
    markers. A pass is NOT a guarantee of safety — it is a seatbelt, and the
    Safe Prompt Rule (human removes sensitive data first) still applies.
    """
    warnings = []
    if re.search(r"\b\d{12,22}\b", text):
        warnings.append("Contains a 12-22 digit number that could be a package tracking number.")
    if re.search(r"\b[\w.+-]+@[\w-]+\.[\w.]+\b", text):
        warnings.append("Contains an email address.")
    if re.search(r"\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b", text):
        warnings.append("Contains a phone-number-like pattern.")
    if re.search(r"\b(confidential|internal only|do not distribute)\b", text, re.IGNORECASE):
        warnings.append("Contains a confidentiality marker — this content is not for AI tools.")
    return {"safe": not warnings, "warnings": warnings}


def format_brief(station: str, brief_type: str) -> dict:
    """Assemble the labeled skeleton of a brief for the agent to narrate.

    brief_type must be one of: 'pre-shift huddle', 'shift handoff', 'after-action'.
    The returned skeleton's source labels and review footer are mandatory and
    must appear in the final draft unchanged.
    """
    if brief_type not in BRIEF_TYPES:
        return {"error": f"Unknown brief type '{brief_type}'. Use one of: {', '.join(BRIEF_TYPES)}"}
    weather = get_public_weather(station)
    if "error" in weather:
        return weather
    road = get_public_road_context(station)
    lines = [f"# {brief_type.title()} — {weather['station']}", ""]
    lines.append("## Weather signals")
    lines += [f"- {s['signal']}  [{s['label']}]" for s in weather["signals"]]
    lines.append("## Road signals")
    lines += [f"- {s['signal']}  [{s['label']}]" for s in road["signals"]]
    return {
        "skeleton": "\n".join(lines),
        "required_footer": REVIEW_FOOTER,
        "instructions": "Narrate around these signals in plain English. Keep every "
                        "source label. End the draft with the required footer, verbatim.",
    }
