from flask import Blueprint, render_template, session, redirect, url_for

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def index():
    if session.get("business_id"):
        return redirect(url_for("pages.dashboard"))
    return render_template("login.html")


@pages_bp.route("/dashboard")
def dashboard():
    if not session.get("business_id"):
        return redirect(url_for("pages.index"))
    return render_template("dashboard.html", business_id=session["business_id"])


@pages_bp.route("/chat")
def chat_page():
    if not session.get("business_id"):
        return redirect(url_for("pages.index"))
    return render_template("chat.html", business_id=session["business_id"])
