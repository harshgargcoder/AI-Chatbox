import axios from 'axios';

const API_KEY = 'AIzaSyBJK5KfHNgW6tmWAV7V0-PqKZCE4pfhL14';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const chatbotApi = {
  
  async sendMessage(userMessage, messageHistory = []) {
    try {
      const response = await axios({
        url: `${BASE_URL}?key=${API_KEY}`,
        method: 'post',
        data: {
          contents: [
            ...messageHistory.map(msg => ({
              parts: [{ text: msg.text }],
              role: msg.sender === 'user' ? 'user' : 'model'
            })),
            {
              parts: [{ text: userMessage }],
              role: 'user'
            }
          ],
          generationConfig: {
            temperature: 0.9,
            topP: 1,
            topK: 1,
            maxOutputTokens: 2048
          }
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Chatbot API error:', error);
      throw new Error(
        error.response?.data?.error?.message || 
        'Failed to get response from chatbot'
      );
    }
  }
};

export default chatbotApi;