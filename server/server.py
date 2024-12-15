from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import translator

from medical_llm_function import ask_questions

key = os.getenv("HYPERBOLIC_KEY")

# Set up Flask app
app = Flask(__name__)
CORS(app)

@app.route('/triage', methods=['POST'])
def triage():
    data = request.get_json()

    if 'patient_input' in data:
        patient_input = data['patient_input']
        assistant_reply = ask_questions(patient_input)
    else:
        assistant_reply = ask_questions()

    return jsonify({
        "assistant_reply": assistant_reply
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)