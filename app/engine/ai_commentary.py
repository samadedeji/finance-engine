"""
AI Commentary
-------------
Optional AI-generated insights/advice layer on top of the rule-based
report already produced by core.get_report(). Fully isolated: failure
here never breaks reporting — it just falls back to the rule-based text
that core.py already computed.
"""

import os
import json
from google import genai

_API_KEY = os.environ.get("GEMINI_API_KEY")
_client = genai.Client(api_key=_API_KEY) if _API_KEY else None
_MODEL_NAME = "gemini-2.5-flash"


def generate_ai_commentary(report: dict, timeout: int = 5) -> dict:
    """
    Takes the report dict already produced by get_report() and returns
    AI-generated commentary, or falls back to the rule-based insights/advice
    already present in `report` if anything goes wrong.

    Returns: {"insights": [...], "advice": [...], "source": "ai" | "fallback"}
    """
    fallback = {
        "insights": report.get("insights", []),
        "advice": report.get("advice", []),
        "source": "fallback",
    }

    if _client is None:
        # No API key configured — silently use the rule-based engine.
        return fallback

    prompt = f"""
You are a financial assistant for a small business owner in Nigeria.
Given this week's numbers, respond with STRICT JSON only, no other text:
{{"insights": ["...", "..."], "advice": ["..."]}}

Rules:
- 2 insights, 1 piece of advice
- each item under 20 words, plain language, no jargon

Total income: {report.get('total_income')}
Total expenses: {report.get('total_expenses')}
Net: {report.get('net')}
Income trend: {report.get('income_trend_pct')}%
Expense trend: {report.get('expense_trend_pct')}%
Top expense categories: {report.get('top_expense_categories')}
"""

    try:
        response = _client.models.generate_content(
            model=_MODEL_NAME,
            contents=prompt,
        )
        text = response.text.strip()
        # Strip markdown code fences if the model wraps its JSON in them
        if text.startswith("```"):
            text = text.strip("`").lstrip("json").strip()

        parsed = json.loads(text)
        insights = parsed.get("insights")
        advice = parsed.get("advice")

        if not insights or not advice:
            return fallback

        return {"insights": insights, "advice": advice, "source": "ai"}

    except Exception:
        # Any failure (timeout, bad JSON, API error, rate limit) — fall
        # back silently. The demo should never break because of this.
        return fallback
