#!/usr/bin/env python3
"""Offline checks for the ADK shift-brief agent starter kit.

Runs with the Python standard library only — no API key, no network, no
google-adk required. If google-adk IS installed, additionally verifies the
agent wiring. CI runs this on every PR.
"""

import re
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(KIT))

failures = []


def check(name: str, ok: bool, detail: str = ""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f" — {detail}" if detail and not ok else ""))
    if not ok:
        failures.append(name)


# --- tools behave, offline ---------------------------------------------------
# Load tools.py directly by path: the package __init__ imports the agent (the
# `adk run` convention), which needs google-adk — the tools must not.
import importlib.util  # noqa: E402

_spec = importlib.util.spec_from_file_location(
    "shift_brief_tools", KIT / "shift_brief_agent" / "tools.py")
tools = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(tools)

stations = tools.list_stations()
check("list_stations returns labeled demo stations",
      "SYNTHETIC" in stations["data_label"] and len(stations["stations"]) >= 4)

wx = tools.get_public_weather("mem")
check("weather lookup is case-insensitive and labeled",
      "error" not in wx and all("SYNTHETIC" in s["label"] for s in wx["signals"]))

check("unknown station returns a clear error, not a guess",
      "error" in tools.get_public_weather("ZZZ")
      and "Known demo stations" in tools.get_public_weather("ZZZ")["error"])

rd = tools.get_public_road_context("GUC")
check("road lookup returns labeled signals", "error" not in rd and len(rd["signals"]) >= 1)

brief = tools.format_brief("PHX", "pre-shift huddle")
check("format_brief skeleton keeps source labels",
      "error" not in brief and "[SYNTHETIC DEMO" in brief["skeleton"])
check("format_brief requires the review footer",
      brief.get("required_footer") == tools.REVIEW_FOOTER
      and "Needs manager verification" in tools.REVIEW_FOOTER)
check("format_brief rejects unknown brief types",
      "error" in tools.format_brief("PHX", "tweet"))

# --- data-safety gate --------------------------------------------------------
check("safety gate flags tracking-number-like content",
      not tools.check_data_safety("pkg 123456789012 missed scan")["safe"])
check("safety gate flags emails and phone numbers",
      not tools.check_data_safety("call 901-555-1212 or a@b.com")["safe"])
check("safety gate flags confidentiality markers",
      not tools.check_data_safety("INTERNAL ONLY volume plan")["safe"])
check("safety gate passes clean operational text",
      tools.check_data_safety("Winds 40 mph; stage outbound early.")["safe"])

# --- offline guarantee: no network or action surface in tools ----------------
tools_src = (KIT / "shift_brief_agent" / "tools.py").read_text()
check("tools import no network modules",
      not re.search(r"^\s*(import|from)\s+(requests|urllib|http|socket|aiohttp)\b",
                    tools_src, re.MULTILINE))
check("no send/dispatch/write tool surface",
      not re.search(r"def\s+(send|dispatch|reroute|post|write)_", tools_src))

# --- agent wiring (only when google-adk is installed) ------------------------
try:
    import google.adk  # noqa: F401
    HAVE_ADK = True
except ImportError:
    HAVE_ADK = False
    print("SKIP  agent wiring checks (google-adk not installed — tools-only mode)")

if HAVE_ADK:
    from shift_brief_agent.agent import root_agent
    check("root_agent exposes exactly the five read-only tools", len(root_agent.tools) == 5)
    check("instruction pins the review footer",
          tools.REVIEW_FOOTER in root_agent.instruction)
    check("instruction forbids taking actions",
          "cannot send" in root_agent.instruction)
    check("agent has a model configured", bool(root_agent.model))

print()
if failures:
    print(f"{len(failures)} CHECK(S) FAILED")
    sys.exit(1)
print("ALL CHECKS PASSED")
