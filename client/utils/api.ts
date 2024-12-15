import axios from 'axios';

interface ChatRequest {
  patient_input: string;
}

interface ChatResponse {
  assistant_reply: string;
}

export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    const response = await axios.post<ChatResponse>('http://192.168.0.164:5001/triage', { patient_input: message } as ChatRequest);
    return response.data.assistant_reply;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

