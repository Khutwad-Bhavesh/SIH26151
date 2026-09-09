# PS Understanding: Dark Web Threat Actor De-anonymization

## Snapshot
- **PS Code:** SIH26151
- **Organization:** National Technical Research Organisation (NTRO)
- **Category:** Software — Blockchain & Cybersecurity
- **Core Ask:** Design a system to de-anonymize threat actors operating on dark web marketplaces and forums, linking pseudonymous personas to each other (and potentially to real-world identities) across platforms.

## Quick Start (Podman / Docker)
This project is fully containerized for a 1-click deployment during the SIH evaluation. We recommend using **Podman**, a daemonless, open-source alternative to Docker.
1. Install [Podman](https://podman.io/) and `podman-compose`.
2. Run `podman-compose up --build` in your terminal at the root of this project.
3. Open `http://localhost` in your browser to view the interactive Threat Intelligence Dashboard.

## Problem Statement Description
Threat actors — cybercriminals, narcotics/weapons traders, fraud operators — rely on pseudonymous personas across dark web forums and marketplaces to evade attribution. Law enforcement and intelligence agencies currently lack scalable tools to link these personas across platforms without expensive network-level infrastructure (e.g., Tor traffic correlation, which requires access most investigators don't have). This PS asks for an alternative approach: correlate identity signals that *are* accessible — writing style, cryptocurrency wallet reuse, timing patterns, key reuse — to build confidence-scored links between personas.

## Why We Chose This PS
- Genuinely open-ended and technically ambiguous — most teams will either avoid it entirely or attempt a shallow keyword-matching demo. Low realistic competition for a well-executed submission.
- Plays directly to a cybersecurity-first orientation rather than generic app development.
- Forces engagement with a real, unsolved-adjacent problem (OSINT-based identity correlation) instead of a templated "AI monitoring dashboard" PS.
- Strong pitch narrative for NTRO evaluators — this is the kind of analyst-assistance tool real threat-intel teams actually want.

## Why It Matters (Benefits)
- **Investigative value:** helps law enforcement and intelligence narrow down suspect identity clusters without requiring network-level surveillance access.
- **Generalizable output:** the correlation engine isn't dark-web-specific — the same techniques apply to brand protection, fraud investigation, and cross-platform sockpuppet detection.
- **Skill value:** combines NLP (stylometry), graph theory, and blockchain forensics — a rare, high-value combination for a cybersecurity-track student.
- **Ethical cleanliness:** using public academic corpora instead of live scraping keeps the project legally and ethically sound while still being technically credible.

## Proposed Approach (Architecture Snapshot)
1. **Data Ingestion** — academic dark-web text corpora (e.g. CrimeBB/DUTA-style datasets) and public marketplace dumps. No live scraping of illegal content.
2. **Feature Extraction** — stylometric fingerprinting (function-word frequency, syntactic n-grams) + Sentence-BERT semantic embeddings + regex/NER extraction of wallet addresses and PGP key fingerprints.
3. **Correlation Engine** — identity graph where edges are weighted by stylometric similarity, shared wallet/key reuse, and posting-time correlation; Louvain community detection surfaces likely same-actor clusters.
4. **Confidence Scoring** — weighted ensemble fusing the above signals into a single calibrated attribution confidence score per link.
5. **Demo Layer** — interactive graph visualizer showing linked personas with the evidence trail behind each link.

## Tech Stack
| Layer | Tools / Frameworks |
|---|---|
| Data processing | Python, Pandas |
| NLP / Stylometry | scikit-learn, spaCy, Sentence-Transformers |
| Graph / Correlation | NetworkX, python-louvain |
| Wallet extraction | Regex, Etherscan / Blockchain.com APIs (cross-reference) |
| Backend | FastAPI |
| Frontend / Visualization | React + D3.js or Cytoscape.js |
| Storage | In-Memory Processing (Neo4j / PostgreSQL ready) |

## USP & Unique Idea
Most teams that attempt a "dark web" PS will lean on a single weak signal (usually just text similarity) and call it attribution. Our differentiator is **multi-signal confidence fusion** — no single technique proves a link, but combining stylometry + wallet reuse + timing correlation into a calibrated score mirrors how real threat-intel analysts actually work.

The unique idea layered on top: build this as an **explainable attribution system**, not a black box. Every graph edge shows exactly *why* two personas were linked — which signals fired and at what confidence. For a security/intelligence use case, an unexplained "these are the same person" claim is worthless to an analyst; the explainability is the actual product.

## Key Challenges to De-risk First
- Validate that stylometric separation actually distinguishes authors on the chosen dataset before building the full pipeline (research spike #1).
- Confirm data sourcing stays within public research corpora — no live dark web scraping.

## Expected Outcome
A working demo linking 2+ personas across separate forum/marketplace datasets, with a visual evidence graph and per-link confidence scores, positioned as an analyst-assistance tool rather than a fully automated deanonymization weapon.
