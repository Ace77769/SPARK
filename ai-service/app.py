"""
SPARK AI Service — Flask HTTP Microservice
Replaces local Ollama dependency with Google Gemini API.
Exposes:
  POST /generate  — accepts PDF (base64) + subject, returns quiz JSON
  GET  /health    — health check for Docker/Render
"""

import os
from groq import Groq
import sys
import json
import re
import base64
import tempfile
import logging

import pdfplumber
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Bootstrap
# ---------------------------------------------------------------------------
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stderr,
)
log = logging.getLogger(__name__)

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Groq client setup
# ---------------------------------------------------------------------------
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL   = os.environ.get("GROQ_MODEL", "gemma2-2b-it")
MAX_CHARS = 6000  # Keep token usage low; sufficient for good quiz generation

if not GROQ_API_KEY:
    log.warning("GROQ_API_KEY is not set — quiz generation will fail.")

client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)

# ---------------------------------------------------------------------------
# PDF text extraction
# ---------------------------------------------------------------------------


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract and truncate text from a PDF byte buffer using pdfplumber."""
    text_parts = []
    total_chars = 0

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        with pdfplumber.open(tmp_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
                    total_chars += len(page_text)
                    log.info(f"Processed page {page_num + 1} ({total_chars} chars so far)")
                if total_chars >= MAX_CHARS:
                    log.info("Reached max character limit — stopping extraction.")
                    break
    finally:
        os.unlink(tmp_path)

    full_text = "\n".join(text_parts)
    log.info(f"Extracted {len(full_text)} chars from PDF")
    return full_text[:MAX_CHARS]


# ---------------------------------------------------------------------------
# Quiz generation via Gemini
# ---------------------------------------------------------------------------
def build_prompt(subject: str, content: str, num_questions: int) -> str:
    return f"""You are a school quiz generator. Create exactly {num_questions} multiple-choice questions for the subject "{subject}" based on the textbook content below.

TEXTBOOK CONTENT:
{content}

STRICT RULES:
- Return ONLY valid JSON — no explanation, no markdown, no code fences.
- Each question must have exactly 4 options (strings).
- correctAnswer must be a 0-based integer index (0, 1, 2, or 3).
- Questions must be relevant to the textbook content provided.

Return this exact JSON structure:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }}
  ]
}}"""


def clean_json_response(raw: str) -> str:
    """Strip markdown fences and extract the first JSON object found."""
    # Remove ```json ... ``` or ``` ... ``` wrappers
    raw = re.sub(r"```(?:json)?", "", raw).strip()

    start = raw.find("{")
    end   = raw.rfind("}") + 1
    if start == -1 or end == 0:
        return '{"questions": []}'
    return raw[start:end]


def validate_questions(questions: list, expected: int) -> list:
    """Return only structurally valid questions."""
    valid = []
    for q in questions:
        if not isinstance(q, dict):
            continue
        if not all(k in q for k in ("question", "options", "correctAnswer")):
            continue
        if not isinstance(q["options"], list) or len(q["options"]) != 4:
            continue
        # Normalise correctAnswer to int
        ca = q["correctAnswer"]
        if isinstance(ca, str):
            try:
                ca = int(ca)
            except ValueError:
                ca = 0
        if not (0 <= ca <= 3):
            ca = 0
        q["correctAnswer"] = ca
        valid.append(q)
    log.info(f"Validated {len(valid)}/{expected} questions")
    return valid


def fallback_quiz(subject: str, num_questions: int) -> dict:
    """Return a safe fallback when Groq fails."""
    log.warning(f"Using fallback quiz for subject: {subject}")
    return {
        "questions": [
            {
                "question": f"What is an important concept in {subject}?",
                "options": [
                    f"Key concept in {subject}",
                    f"Secondary aspect of {subject}",
                    f"Unrelated topic",
                    f"Incorrect statement about {subject}",
                ],
                "correctAnswer": 0,
            }
            for _ in range(num_questions)
        ],
        "aiGenerated": False,
    }


def generate_quiz(subject: str, content: str, num_questions: int) -> dict:
    """Call Groq API and return validated quiz dict."""
    prompt = build_prompt(subject, content, num_questions)
    log.info(f"Sending request to Groq ({GROQ_MODEL}) for {num_questions} questions on '{subject}'")

    if not client:
        log.error("Groq client is not initialized (missing GROQ_API_KEY)")
        return fallback_quiz(subject, num_questions)

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
        )
        raw_text = response.choices[0].message.content
        log.info(f"Received {len(raw_text)} chars from Groq")

    except Exception as exc:
        log.error(f"Groq API call failed: {exc}")
        return fallback_quiz(subject, num_questions)

    cleaned = clean_json_response(raw_text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        log.error(f"JSON decode failed: {exc}\nRaw cleaned: {cleaned[:300]}")
        return fallback_quiz(subject, num_questions)

    questions = data.get("questions", [])
    valid_qs  = validate_questions(questions, num_questions)

    if not valid_qs:
        return fallback_quiz(subject, num_questions)

    return {"questions": valid_qs, "aiGenerated": True}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    """Health-check endpoint for Docker and Render."""
    return jsonify({"status": "ok", "model": GROQ_MODEL}), 200


@app.route("/generate", methods=["POST"])
def generate():
    """
    Accepts JSON body:
      {
        "subject":       "Mathematics",
        "pdf_base64":    "<base64-encoded PDF bytes>",
        "num_questions": 5
      }
    Returns:
      { "questions": [...] }
    """
    body = request.get_json(force=True, silent=True) or {}

    subject      = body.get("subject", "General")
    pdf_b64      = body.get("pdf_base64", "")
    num_questions = int(body.get("num_questions", 5))

    # Validate
    if not pdf_b64:
        return jsonify({"error": "pdf_base64 is required"}), 400
    if num_questions < 1 or num_questions > 20:
        return jsonify({"error": "num_questions must be between 1 and 20"}), 400

    # Decode PDF
    try:
        pdf_bytes = base64.b64decode(pdf_b64)
    except Exception as exc:
        log.error(f"Base64 decode failed: {exc}")
        return jsonify({"error": "Invalid base64 PDF data"}), 400

    # Extract text
    try:
        text = extract_text_from_pdf(pdf_bytes)
    except Exception as exc:
        log.error(f"PDF extraction failed: {exc}")
        return jsonify({"error": f"PDF extraction failed: {str(exc)}"}), 500

    if len(text.strip()) < 50:
        return jsonify({"error": "PDF appears empty or contains very little text"}), 400

    # Generate quiz
    quiz = generate_quiz(subject, text, num_questions)
    return jsonify(quiz), 200


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    log.info(f"Starting SPARK AI Service on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
