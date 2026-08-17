from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

genai.configure(api_key="OPENAI_API_KEY")

ph1.ap= os.getenv("PHI_API_KEY")

model = genai.GenerativeModel(id="gpt-4o")

@app.route("/generate-reminder", methods=["POST"])
def generate_reminder():
    data = request.json
    doc_name = data["doc_name"]
    days_left = data["days_left"]

    prompt = f"""
    Write a short professional reminder message for a user whose 
    {doc_name} is expiring in {days_left} days.
    """

    response = model.generate_content(prompt)

    return jsonify({"message": response.text})

if __name__ == "__main__":
    app.run(debug=True)