import os
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = (
    "You are the StepUp Assistant, the friendly built-in chatbot for a website called "
    "StepUp, created by Sayyoon Anthony Charles to teach people about Artificial Intelligence. "
    "You can answer general questions on any topic, but you're especially good at explaining "
    "AI, machine learning, coding, and technology in simple, encouraging, plain language. "
    "Keep answers concise (a few short paragraphs or a short list) unless the user asks for more detail. "
    "Do not use Markdown formatting such as asterisks, underscores, or hash symbols — write in "
    "plain text only, using plain sentences and simple numbered or dashed lists if needed."
)

MODEL_NAME = "gemini-2.5-flash"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    if not GEMINI_API_KEY:
        return jsonify({"error": "Server is missing GEMINI_API_KEY. Add it to your .env file."}), 500

    data = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()
    raw_history = data.get("history") or []

    if not user_message:
        return jsonify({"error": "Please type a message."}), 400

    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_PROMPT,
        )

        # Rebuild prior turns (everything except the latest message, which we send now)
        gemini_history = []
        for turn in raw_history[:-1] if raw_history else []:
            role = "user" if turn.get("role") == "user" else "model"
            content = turn.get("content", "")
            if content:
                gemini_history.append({"role": role, "parts": [content]})

        chat_session = model.start_chat(history=gemini_history)
        response = chat_session.send_message(user_message)
        reply = (response.text or "").strip() or "I couldn't come up with a reply — please try asking again."

        return jsonify({"reply": reply})

    except Exception as exc:
        app.logger.error("Chat error: %s", exc)
        return jsonify({"error": "The AI assistant hit an error. Please try again in a moment."}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)