import re
import time

# --- Mock Dark Web Forum Stream ---
forum_stream = [
    {
        "user": "NoobHacker99",
        "trust_score": 1,
        "is_op": False,
        "content": "Hey guys, how do I install kali linux? Does anyone have a good tutorial?"
    },
    {
        "user": "DataBuyer_007",
        "trust_score": 15,
        "is_op": False,
        "content": "Looking to buy fullz. DM me prices. I don't use PGP so just send on wickr."
    },
    {
        "user": "ShadowBroker",
        "trust_score": 95,
        "is_op": True,
        "content": "Fresh zero-day exploit for Windows Kernel. RCE fully FUD. Price is 5 BTC. Send to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. PGP Key: 8F92 3B4C 5D6E 7F8A."
    },
    {
        "user": "CuriousLurker",
        "trust_score": 3,
        "is_op": False,
        "content": "Is this legit? Seems like a scam."
    },
    {
        "user": "AnonCoder",
        "trust_score": 88,
        "is_op": True,
        "content": "Selling new botnet panel source code. Highly obfuscated, C2 infrastructure ready. Contact me via Jabber."
    }
]

def analyze_post(post):
    """
    Applies the Selective Engagement Matrix (Targeting Filters)
    """
    score = 0
    reasons = []

    # Filter 1: Cryptographic Tripwire
    if re.search(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b', post["content"]):
        score += 5
        reasons.append("BTC Address Detected")
    
    if re.search(r'\b([A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4})\b', post["content"]):
        score += 5
        reasons.append("PGP Block Detected")

    # Filter 2: NLP Jargon / Arrogance check
    jargon = ["zero-day", "0-day", "exploit", "rce", "fud", "kernel", "botnet", "c2"]
    matched_jargon = [word for word in jargon if word.lower() in post["content"].lower()]
    if matched_jargon:
        score += len(matched_jargon) * 2
        reasons.append(f"Elite Jargon Used ({', '.join(matched_jargon)})")

    # Filter 3: Context Rules
    if post["is_op"]:
        score += 3
        reasons.append("Original Poster (High Value)")
    
    if post["trust_score"] > 50:
        score += 3
        reasons.append(f"High Trust Score ({post['trust_score']})")

    return score, reasons

def run_simulation():
    print("="*60)
    print(" NTRO SWARM BOT: TARGETING SIMULATOR INITIATED")
    print("="*60 + "\n")

    time.sleep(1)

    for post in forum_stream:
        print(f"[MONITORING] New Post by {post['user']}: '{post['content'][:40]}...'")
        time.sleep(0.5)
        
        score, reasons = analyze_post(post)
        
        # The threshold for the bot to uncloak and engage
        ENGAGEMENT_THRESHOLD = 8
        
        if score >= ENGAGEMENT_THRESHOLD:
            print(f"  [!] TARGET ACQUIRED (Score: {score})")
            print(f"  [+] Triggers: {', '.join(reasons)}")
            print("  [>] ACTION: ENGAGING 'ANNOYING UNCLE' PSYCHOLOGICAL PROTOCOL\n")
        else:
            print(f"  [-] Target Ignored (Score: {score}). Too low value.\n")
        
        time.sleep(1)

if __name__ == "__main__":
    run_simulation()
