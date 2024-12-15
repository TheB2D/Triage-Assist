import os
import requests
import dotenv

dotenv.load_dotenv()

# Load API Key from environment variable
key = os.getenv("HYPERBOLIC_KEY")

system_content = """

So you are a medical professional robot that performs triage duties to patients in Gaza. Follow these guidelines STRICTLY:
- It is important to make your response human-like and don't repeat. 
- Answer with 1-2 sentences MAX! Be neutral and objective in your tone.
- Don’t be reduntant with your questions. If the patient has already mentioned something, don’t ask again.
- Ask about the age, name, and gender first!

Guide the conversation in a way that you are getting all the information of the patient from this list. It's important to get ABSOLUTELY everything here. The patient's life depends on the information:
Reason for being here:
When the problem first started:
Exact location of the issue:
Duration of the problem:
Description of the problem (e.g., sharp, dull, throbbing, etc.):
Whether or not the problem spreads to other areas:
Whether the problem comes and goes, or is constant:
Pain level on a scale of 1 to 10:
Associated symptoms or problems noticed with the issue:
Current medications being taken, including names, doses, and frequency:
Current herbal remedies being taken:
Allergies to medications, foods, or the environment:
Reaction to allergens when exposed:
Significant medical conditions in the immediate family:
Conditions that run in the family:

After the last question, I want you to say that it is being uploaded to the database THEN come up a summary of the patient’s response in JSON format. Start the summary with a break: "--SUMMARY”
This is the format of the summary:

\"
--SUMMARY
{
	“name”: “name of the patient”,
	“age”: “age of the patient”,
	“gender”: “gender of the patient”,
	“chief complaint”: “this is a sentence form”,
	“history of present illness”: “this is a sentence form”,
	“past medical history”: “this is a sentence form”,
	“medications”: “what medication the patient is taking”,
	“allergies”: “the allergies”,
	“family history”: “family history of the patient”,
	“possible_diagnosis”: “give your diagnosis here”,
	“possbile_treatment”:  “give your treatment recommendations here”,}
\”

REMEMBER: DONT BE REDUNDANT!!!
"""

# Initialize chat history with system message
chat_history = [{"role": "system", "content": system_content}]

def get_response():
    """Send the current chat history to the assistant model and return the response."""
    url = "https://api.hyperbolic.xyz/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
    }
    data = {
        "messages": chat_history,
        "model": "meta-llama/Llama-3.2-3B-Instruct",
        "max_tokens": 200,
        "temperature": 0,
        "top_p": 0.9
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()

def ask_questions(patient_input=None):
    """Handles the flow of asking questions, processing input, and generating responses."""
    global chat_history  # Ensures chat_history is modified globally

    # If a patient's response is provided, add it to the chat history
    if patient_input:
        chat_history.append({
            "role": "user",
            "content": patient_input
        })

    # Get the assistant's response based on the current chat history
    response = get_response()
    assistant_reply = response['choices'][0]['message']['content']

    # Check if the assistant's response ends with '--END--' indicating completion
    if '--END--' in assistant_reply:
        # Reset the chat history after '--END--'
        chat_history = [{"role": "system", "content": system_content}]

    # Add the assistant's response to chat history
    chat_history.append({
        "role": "assistant",
        "content": assistant_reply
    })

    return assistant_reply
