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

# Matches a number optionally followed by a currency word/symbol, capturing
# both the number and whether a currency marker was attached to it.
AMOUNT_PATTERN = re.compile(
    r"(\d[\d,]*(?:\.\d+)?)\s*(naira|ngn|₦)?", re.IGNORECASE
)


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

    matches = AMOUNT_PATTERN.findall(lowered)
    if not matches:
        return None

    # Prefer a number that has a currency word/symbol directly attached
    # (e.g. "500 naira") — this is the actual price, not a quantity.
    currency_tagged = [num for num, currency in matches if currency]
    if currency_tagged:
        amount = float(currency_tagged[-1].replace(",", ""))
    else:
        # No currency marker anywhere in the message. Fall back to the last
        # number mentioned, since your documented formats state quantity
        # first and price last (e.g. "spent 1500 on transport",
        # "sold 3 sachets for 500") rather than picking the largest number,
        # which wrongly favors quantities like "sold 100 units for 20 naira".
        amount = float(matches[-1][0].replace(",", ""))

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