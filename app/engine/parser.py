"""
Message Parser
---------------
Rule-based parsing for short, WhatsApp-style transaction messages.
No ML/NLP dependency — deliberately simple and explainable, matched to a
documented set of supported phrasings.

Supported examples:
    "sold 3 sachets, 500 naira"      -> income / sales
    "bought supplies 2000"           -> expense / supplies
    "spent 1500 on transport"        -> expense / transport
    "paid 3000 for rent"             -> expense / rent
"""

import re

INCOME_KEYWORDS = ["sold", "received", "earned"]
EXPENSE_KEYWORDS = ["bought", "spent", "paid"]

CATEGORY_KEYWORDS = {
    "rent": "rent",
    "supplies": "supplies",
    "transport": "transport",
    "fuel": "transport",
    "salary": "salaries",
    "salaries": "salaries",
    "wages": "salaries",
}

AMOUNT_PATTERN = re.compile(r"(\d[\d,]*(?:\.\d+)?)\s*(?:naira|ngn|₦)?", re.IGNORECASE)


def parse_message(text: str) -> dict:
    """
    Parses a short transaction message into a structured dict:
        {"type": "income"|"expense", "category": str, "amount": float, "note": str}

    Returns None if the message can't be confidently parsed — callers should
    handle that by asking the user to rephrase, rather than guessing.
    """
    if not text or not text.strip():
        return None

    original = text.strip()
    lowered = original.lower()

    txn_type = None
    for kw in INCOME_KEYWORDS:
        if kw in lowered:
            txn_type = "income"
            break
    if txn_type is None:
        for kw in EXPENSE_KEYWORDS:
            if kw in lowered:
                txn_type = "expense"
                break
    if txn_type is None:
        return None

    amounts = AMOUNT_PATTERN.findall(lowered)
    if not amounts:
        return None
    # Take the largest number found — avoids false positives from things
    # like "3 sachets" being picked over the actual price.
    amount = max(float(a.replace(",", "")) for a in amounts)
    if amount <= 0:
        return None

    category = "sales" if txn_type == "income" else "other"
    for kw, cat in CATEGORY_KEYWORDS.items():
        if kw in lowered:
            category = cat
            break

    return {
        "type": txn_type,
        "category": category,
        "amount": amount,
        "note": original,
    }
