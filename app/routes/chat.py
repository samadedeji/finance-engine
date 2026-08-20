from flask import Blueprint, request, jsonify

from app.engine.parser import parse_message
from app.engine.core import add_transaction, get_report

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    """
    Simulates a WhatsApp-style interaction.
    Body: { "business_id": 1, "message": "sold 3 sachets, 500 naira" }

    This endpoint is deliberately the only thing that would change if this
    were wired to a real WhatsApp Business API webhook later — everything
    it calls (parse_message, add_transaction, get_report) stays the same.
    """
    data = request.get_json(silent=True) or {}
    business_id = data.get("business_id")
    message = data.get("message", "")

    if not business_id:
        return jsonify({"error": "business_id is required"}), 400

    lowered = message.strip().lower()

    # Simple query intents, separate from transaction logging
    if lowered in ("how's my week?", "how is my week", "how's my week", "report", "summary"):
        report = get_report(business_id, period="week")
        reply = _format_report_reply(report)
        return jsonify({"reply": reply, "report": report}), 200

    parsed = parse_message(message)
    if parsed is None:
        return jsonify({
            "reply": "I couldn't quite understand that. Try something like: "
                     "'sold 3 sachets, 500 naira' or 'spent 1500 on transport'."
        }), 200

    txn = add_transaction(
        business_id=business_id,
        type=parsed["type"],
        amount=parsed["amount"],
        category=parsed["category"],
        note=parsed["note"],
        source="whatsapp",
    )

    verb = "Logged sale" if parsed["type"] == "income" else "Logged expense"
    reply = f"{verb}: ₦{parsed['amount']:.0f} ({parsed['category']}). Noted!"
    return jsonify({"reply": reply, "transaction": txn}), 201


def _format_report_reply(report: dict) -> str:
    lines = [
        f"This week: ₦{report['total_income']:.0f} in, ₦{report['total_expenses']:.0f} out, "
        f"net ₦{report['net']:.0f}."
    ]
    lines.extend(report["insights"])
    if report["advice"]:
        lines.append("Advice: " + report["advice"][0])
    return " ".join(lines)
