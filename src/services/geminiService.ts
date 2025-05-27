
export interface GeminiResponse {
  text: string;
  error?: string;
}

class GeminiService {
  private baseUrl: string = 'http://localhost:8000/api/gemini';

  async generateResponse(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      return { text: data.text };
    } catch (error) {
      console.error('Backend API call failed:', error);
      return { 
        text: 'Sorry, I encountered an error processing your request.', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const geminiService = new GeminiService();
