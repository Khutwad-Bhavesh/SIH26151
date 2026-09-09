# Project: NTRO De-Anon Engine
## Module Idea: Active Reconnaissance Swarm (The "Annoying Uncle" Protocol)

### Core Concept
Instead of passively waiting for hackers to make a mistake (OpSec failure), we **force the mistake** using active psychological manipulation.

Deploy a swarm of LLM-powered bots into Dark Web forums (Dread, BreachForums, etc.) that act like a mix of CCTV cameras and "annoying local aunties." 

### The Psychology (How it works)
Hackers, especially elite ones, are driven by massive egos and high paranoia. The swarm bots target these emotional vulnerabilities:

1. **The Ego Stroke (Flattery):** Bots act as polite, overly eager "noobs" who constantly praise the target's code or hacks. This lowers the target's guard and encourages them to boast (which leads to oversharing technical details or real-world timelines).
2. **The Rage Bait (Annoyance):** Bots intentionally misunderstand the hacker, ask repetitive annoying questions, or subtly insult their work while remaining technically "polite." This triggers anger. Angry people type fast, forget to double-check their VPNs, and make emotional mistakes.
3. **The Uncanny Valley:** By being slightly "off" but persistently present in every thread the target posts in, the bots act as a psychological pressure cooker. 

### What the Bots Actually Do
- **Mapping:** They map out who interacts with whom (building the Cytoscape graph dynamically).
- **Phishing:** When the target is enraged or distracted, the bot slips in a seemingly benign link (a canary token or zero-click exploit) to grab their real IP address.
- **Linguistic Priming:** The bots use specific rare words or sentence structures to see if the hacker starts adopting them, allowing us to track the hacker if they switch to a new username (Stylometric poisoning).

### Why this is a Game Changer
Passive OSINT only works if the target is careless. **Active Swarm OSINT** weaponizes the target's own human emotions (Ego and Temper) against them, manufacturing the exact OpSec failures our `analyzer.py` is looking for.
