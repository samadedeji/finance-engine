from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.engine.parser import parse_message, classify_query
from app.engine.core import add_transaction, get_report
from app.models.transaction import Transaction

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    """
    Simulates a WhatsApp-style interaction.
    Supports: single transactions, report queries, undo, bulk paste.
    """
    business_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")
    lowered = message.strip().lower()

    # ── Undo last transaction ──
    if lowered in ("undo", "undo that", "delete last", "remove last"):
        last = (
            Transaction.query.filter_by(business_id=business_id)
            .order_by(Transaction.created_at.desc())
            .first()
        )
        if last:
            db.session.delete(last)
            db.session.commit()
            return jsonify({
                "reply": f"Undone: ₦{last.amount:.0f} ({last.category}). Removed.",
                "deleted": last.to_dict(),
            }), 200
        return jsonify({"reply": "Nothing to undo — your transaction list is empty."}), 200

    # ── Check for report query intents ──
    query_period = classify_query(message)
    if query_period:
        report = get_report(business_id, period=query_period)
        reply = _format_report_reply(report)
        return jsonify({"reply": reply, "report": report}), 200

    # ── Bulk paste: multiple lines, each a transaction ──
    lines = [l.strip() for l in message.strip().split("\n") if l.strip()]
    if len(lines) > 1:
        results = []
        for line in lines:
            parsed = parse_message(line)
            if parsed:
                txn = add_transaction(
                    business_id=business_id,
                    type=parsed["type"],
                    amount=parsed["amount"],
                    category=parsed["category"],
                    note=parsed["note"],
                    source="whatsapp",
                )
                results.append({"line": line, "transaction": txn})
        if results:
            total = sum(r["transaction"]["amount"] for r in results)
            return jsonify({
                "reply": f"Logged {len(results)} transactions totalling ₦{total:.0f}.",
                "transactions": [r["transaction"] for r in results],
                "count": len(results),
            }), 201
        return jsonify({
            "reply": "I couldn't parse any of those lines. Try: 'sold 3 sachets, 500 naira'"
        }), 200

    # ── Single transaction ──
    parsed = parse_message(message)
    if parsed is None:
        return jsonify({
            "reply": "I couldn't quite understand that. Try something like: "
                     "'sold 3 sachets, 500 naira' or 'spent 1500 on transport'. "
                     "Or type 'undo' to remove your last entry."
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
    period_label = {"day": "Today", "week": "This week", "month": "This month"}.get(
        report["period"], "This period"
    )
    lines = [
        f"{period_label}: ₦{report['total_income']:.0f} in, "
        f"₦{report['total_expenses']:.0f} out, net ₦{report['net']:.0f}."
    ]
    lines.extend(report["insights"])
    if report["advice"]:
        lines.append("Advice: " + report["advice"][0])
    return " ".join(lines)
