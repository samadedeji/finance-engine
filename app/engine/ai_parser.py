"""
AI Message Parser
------------------
Optional AI-based parsing for more natural WhatsApp-style messages than
the rule-based parser.parse_message() can handle. Fully isolated: failure
here never breaks chat logging — it just falls back to the regex-based
parser, which stays the default and the safety net.
"""

import os
import json
from google import genai

from app.engine.parser import parse_message as parse_message_rule_based
from app.models.transaction import CATEGORIES

_API_KEY = os.environ.get("GEMINI_API_KEY")
_client = genai.Client(api_key=_API_KEY) if _API_KEY else None
_MODEL_NAME = "gemini-2.5-flash"


def parse_message_ai(text: str, timeout: int = 5) -> dict:
    """
    Attempts to parse a transaction message using AI for more natural
    phrasing than the regex parser supports. Falls back to the rule-based
    parser.parse_message() if the AI call fails, returns malformed data,
    or no API key is configured.

    Returns the same shape as parser.parse_message():
        {"type": "income"|"expense", "category": str, "amount": float, "note": str}
    or None if neither approach could parse the message.
    """
    if not text or not text.strip():
        return None

    if _client is None:
        # No API key configured — go straight to the rule-based parser.
        return parse_message_rule_based(text)

    prompt = f"""
Extract a business transaction from this message. Respond with STRICT
JSON only, no other text:
{{"type": "income" or "expense", "category": one of {CATEGORIES}, "amount": number}}

If the message doesn't describe a sale, purchase, or expense, respond
with: {{"type": null}}

Message: "{text}"
"""

    try:
        response = _client.models.generate_content(
            model=_MODEL_NAME,
            contents=prompt,
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.strip("`").lstrip("json").strip()

        parsed = json.loads(raw)
        txn_type = parsed.get("type")
        amount = parsed.get("amount")
        category = parsed.get("category", "other")

        if txn_type not in ("income", "expense"):
            return parse_message_rule_based(text)
        if not isinstance(amount, (int, float)) or amount <= 0:
            return parse_message_rule_based(text)
        if category not in CATEGORIES:
            category = "other"

        return {
            "type": txn_type,
            "category": category,
            "amount": float(amount),
            "note": text.strip(),
        }

    except Exception:
        # Any failure (timeout, bad JSON, API error, rate limit) — fall
        # back to the regex parser rather than losing the transaction.
        return parse_message_rule_based(text)
