
export interface GeminiResponse {
  text: string;
  error?: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    // Store API key in localStorage for local development
    this.apiKey = localStorage.getItem('gemini_api_key') || 'AIzaSyAfHYZ4RPOavnbAVnkEzGurKOYVW1U3RnE';
    if (!localStorage.getItem('gemini_api_key')) {
      localStorage.setItem('gemini_api_key', this.apiKey);
    }
  }

  async generateResponse(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      
      return { text };
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return { 
        text: 'Sorry, I encountered an error processing your request.', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  updateApiKey(newKey: string): void {
    this.apiKey = newKey;
    localStorage.setItem('gemini_api_key', newKey);
  }
}

export const geminiService = new GeminiService();
