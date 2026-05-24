import sys
import json
import requests
import re
import pdfplumber
import os

# ✅ Fix Unicode (emoji/log) encoding issue permanently
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')


class QuizGenerator:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"

    def log(self, message):
        """Send logs to stderr to avoid breaking JSON parsing in Node.js"""
        print(message, file=sys.stderr)

    # ✅ Extract text and handle large PDFs by chunking
    def extract_text_from_pdf(self, pdf_path, max_chars=9000):
        """Extract and trim text from PDF using pdfplumber"""
        try:
            self.log(f"📘 Extracting text from PDF: {pdf_path}")
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"{page_text}\n"
                    if len(text) >= max_chars:  # stop when reaching max limit
                        self.log("⚠️ Reached max text length limit for AI context.")
                        break
                    self.log(f"✅ Processed page {page_num + 1}")
            self.log(f"📄 Extracted {len(text)} characters from PDF")
            return text
        except Exception as e:
            error_msg = f"❌ Error extracting PDF: {str(e)}"
            self.log(error_msg)
            return error_msg

    def clean_json_response(self, response_text):
        """Clean and fix common JSON issues in AI responses"""
        self.log("🧹 Cleaning JSON response...")
        start_index = response_text.find('{')
        end_index = response_text.rfind('}') + 1

        if start_index == -1 or end_index == 0:
            self.log("❌ No valid JSON object found in response.")
            return '{"questions": []}'

        json_text = response_text[start_index:end_index]
        json_text = json_text.replace("'", '"')
        json_text = re.sub(r'(\s*)(\w+)(\s*):', r'\1"\2"\3:', json_text)
        json_text = re.sub(r',\s*}', '}', json_text)
        json_text = re.sub(r',\s*]', ']', json_text)
        json_text = re.sub(r'"correctAnswer":\s*"(\d+)"', r'"correctAnswer": \1', json_text)

        self.log(f"✅ Cleaned JSON preview: {json_text[:150]}...")
        return json_text

    def generate_quiz(self, subject, textbook_content, num_questions=5):
        """Generate quiz using Ollama"""
        self.log(f"🤖 Generating {num_questions} questions for {subject}")

        prompt = f"""
Create {num_questions} multiple-choice questions for {subject} for school students.
Use the text below as reference.

TEXTBOOK CONTENT:
{textbook_content[:8000]}

Return ONLY valid JSON with DOUBLE QUOTES and exactly {num_questions} questions, like:
{{
  "questions": [
    {{"question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "correctAnswer": 1}}
  ]
}}
"""

        try:
            payload = {
                "model": "gemma:2b",
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.2, "top_p": 0.9, "num_predict": 700}
            }

            self.log("🚀 Sending request to Ollama...")
            response = requests.post(self.ollama_url, json=payload, timeout=120)
            response.raise_for_status()

            result = response.json()
            ai_response = result.get('response', '')
            self.log(f"📩 Received response from Ollama ({len(ai_response)} chars)")

            cleaned_json = self.clean_json_response(ai_response)
            try:
                quiz_data = json.loads(cleaned_json)
                validated_quiz = self.validate_quiz_data(quiz_data, num_questions)
                return validated_quiz
            except json.JSONDecodeError as e:
                self.log(f"❌ JSON parsing failed: {e}")
                return self.create_fallback_quiz(subject, num_questions)

        except Exception as e:
            self.log(f"🔥 Error in quiz generation: {str(e)}")
            return self.create_fallback_quiz(subject, num_questions)

    def validate_quiz_data(self, quiz_data, expected_questions):
        """
        Validate AI-generated quiz data and ensure correctAnswer is an index.
        """
        if not isinstance(quiz_data, dict):
            self.log("❌ Quiz data is not a dictionary.")
            return self.create_fallback_quiz("general", expected_questions)

        questions = quiz_data.get("questions", [])
        if not isinstance(questions, list):
            self.log("❌ Questions are not a list.")
            return self.create_fallback_quiz("general", expected_questions)

        valid_questions = []
        for q in questions:
            if isinstance(q, dict) and "question" in q and "options" in q and "correctAnswer" in q:
                # Convert correctAnswer from string to index if needed
                if isinstance(q["correctAnswer"], str):
                    try:
                        q["correctAnswer"] = q["options"].index(q["correctAnswer"])
                    except ValueError:
                        q["correctAnswer"] = 0  # fallback to first option
                # Ensure options is exactly 4 items
                if isinstance(q["options"], list) and len(q["options"]) == 4:
                    valid_questions.append(q)

        if not valid_questions:
            self.log("⚠️ No valid questions found after validation.")
            return self.create_fallback_quiz("general", expected_questions)

        self.log(f"✅ Validated {len(valid_questions)} questions.")
        return {"questions": valid_questions}

    def create_fallback_quiz(self, subject, num_questions):
        """Fallback in case AI fails"""
        self.log(f"🛠 Creating fallback quiz for {subject}")
        questions = []
        for i in range(num_questions):
            questions.append({
                "question": f"What is an important concept in {subject}?",
                "options": [
                    f"Key concept in {subject} (Correct)",
                    f"Secondary aspect of {subject}",
                    f"Unrelated topic to {subject}",
                    f"Incorrect information about {subject}"
                ],
                "correctAnswer": 0
            })
        return {"questions": questions}


def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python python_ai_service.py <subject> <pdf_path> <num_questions>"}))
        sys.exit(1)

    subject, pdf_path, num_questions = sys.argv[1], sys.argv[2], int(sys.argv[3])
    print("🐍 Python AI Service Started", file=sys.stderr)

    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"PDF file not found: {pdf_path}"}))
        sys.exit(1)

    generator = QuizGenerator()
    textbook_content = generator.extract_text_from_pdf(pdf_path)

    if "Error" in textbook_content:
        print(json.dumps({"error": textbook_content}))
        sys.exit(1)
    if len(textbook_content.strip()) < 50:
        print(json.dumps({"error": "PDF appears to be empty or contains very little text"}))
        sys.exit(1)

    quiz_data = generator.generate_quiz(subject, textbook_content, num_questions)
    print(json.dumps(quiz_data))  # ✅ Final clean JSON output


if __name__ == "__main__":
    main()
