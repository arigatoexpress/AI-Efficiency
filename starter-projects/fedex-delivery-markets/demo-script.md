# Delivery Markets Lab Demo Script

## Opening

This is a synthetic, paper-only prototype. It does not use real FedEx package
data, real customer data, live FedEx APIs, live trading, live settlement, or
wallet signing. The purpose is to show how we can make ambitious ideas reviewable
before they touch production systems.

## Demo Flow

1. Show the starter project folder in this repo.
2. Open the local source repo README or app, if available.
3. Point out the safety posture:
   - synthetic tracking numbers;
   - paper-only mode;
   - no production API credentials;
   - no live money movement;
   - readiness and compliance docs.
4. Walk through the concept:
   - package event uncertainty exists;
   - a simulator creates bounded questions;
   - cutoff gates prevent late information advantage;
   - auditability and privacy controls must come before any real pilot.
5. Stop before live actions.

## What To Say If Asked About Production

This is not production-ready. Production would require official review for data
classification, customer privacy, legal/compliance, eligible participants,
security, operational risk, monitoring, incident response, and ownership.

## What To Ask Governance

- What would be the correct review path for an AI Studio prototype?
- What data can operations managers use in approved AI tools?
- How should we handle synthetic demo data versus sandbox data?
- What must be true before an app can be shared beyond the team?
- What artifacts help governance review faster?

## Demo Close

The team wants a safe, repeatable way to turn field ideas into reviewed pilots.
This repo is the first version of that operating system.
