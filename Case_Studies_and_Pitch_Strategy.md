# SIH 2026 Pitch Strategy: Real-World De-anonymization Case Studies

To win the NTRO track (SIH26151), we need to prove to the judges that our tool isn't just theoretical. The fact that Tor is mathematically secure means that law enforcement *must* rely on the exact vectors we built into our pipeline. 

Here is how you frame your pitch, mapping the 4 features of our code directly to 4 major real-world dark web busts.

## 1. The "Playpen" Bust (Browser/Hardware Fingerprinting)
**What happened:** The FBI took over a child exploitation hidden service called Playpen. Instead of shutting it down immediately, they deployed a Network Investigative Technique (NIT)—essentially a piece of malware/script that exploited a vulnerability in the Tor browser. This script bypassed Tor's routing and sent the users' real hardware signatures (MAC addresses, real IPs, and system configurations) directly to the FBI, leading to hundreds of arrests.
**How it maps to our project:** This is exactly why we implemented the **Remote GPU Timing Hash** and **Monitor Resolution** edges in our graph. We are demonstrating that if a user's browser is compromised or misconfigured, their hardware fingerprint will link their pseudonyms instantly.

## 2. The Silk Road & Welcome to Video (Bitcoin Tracing)
**What happened:** In massive dark web busts (like Silk Road and the Welcome to Video network), investigators analyzed the public Bitcoin blockchain. They traced transactions from dark web wallets to real-world cryptocurrency exchanges (like Coinbase or Binance) where the criminals had provided KYC (Know Your Customer) documents (like passports).
**How it maps to our project:** This validates our **Bitcoin Address Entity Extraction**. By extracting BTC addresses using Regex and mapping them on our graph, we show how reusing a wallet across two different forums links the personas. Once linked, an investigator just needs one of those wallets to touch a public exchange to deanonymize the whole cluster.

## 3. AlphaBay & Alexandre Cazes (OpSec Failures / PGP Reuse)
**What happened:** Alexandre Cazes ran AlphaBay, the largest darknet market at the time. He was caught due to a massive OpSec failure: early in the site's history, the welcome email sent to new users contained his personal Hotmail address (`pimp_alex_91@hotmail.com`). Additionally, investigators found him reusing the same PGP keys across different aliases.
**How it maps to our project:** This justifies our **PGP Key Extraction**. Our pipeline scans for 16-character hexadecimal PGP fingerprints because lazy administrators frequently reuse keys across platforms, creating a hard cryptographic link between their "admin" persona and their "customer" persona on another site.

## 4. Ross Ulbricht / Dread Pirate Roberts (Stylometry)
**What happened:** Ross Ulbricht (founder of Silk Road) was originally flagged by an IRS investigator who noticed that a user named "altoid" on a public programming forum (StackOverflow) was asking coding questions that perfectly matched the backend architecture of Silk Road. Furthermore, the writing style of "altoid" and the Dread Pirate Roberts matched.
**How it maps to our project:** This is the crown jewel of our project: **TF-IDF Stylometric Embeddings**. We prove that even if a criminal uses perfect OpSec (no shared BTC, no shared PGP, perfect hardware masking), their *subconscious writing style* can still betray them and link their accounts.

---

## The Pitch Conclusion
*"Judges, we didn't try to break Tor's cryptography, because that's impossible. Instead, we built a tool that automates the exploitation of human error. By combining hardware fingerprinting, blockchain reuse, cryptographic key reuse, and subconscious stylometry into a single, confidence-weighted identity graph, we have built the exact OSINT tool that NTRO analysts need to replicate the world's biggest dark web takedowns at scale."*
