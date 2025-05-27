
import { UserSession, UserAnswer, Question } from '../types';

export interface ChatHistory {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}

class LocalStorageDB {
  private readonly baseUrl = 'http://localhost:8000/api';

  // Chat History Methods
  async saveChatHistory(chatHistory: ChatHistory): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatHistory),
      });

      if (!response.ok) {
        throw new Error(`Failed to save chat history: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  async getAllChatHistories(): Promise<ChatHistory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat-history`);
      if (!response.ok) {
        throw new Error(`Failed to load chat histories: ${response.status}`);
      }

      const data = await response.json();
      return data.map((history: any) => ({
        ...history,
        createdAt: new Date(history.createdAt),
        messages: history.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Failed to load chat histories:', error);
      return [];
    }
  }

  async getChatHistory(id: string): Promise<ChatHistory | null> {
    const histories = await this.getAllChatHistories();
    return histories.find(h => h.id === id) || null;
  }

  async deleteChatHistory(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat-history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete chat history: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete chat history:', error);
    }
  }

  // Sessions Methods
  async saveSessions(sessions: UserSession[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessions),
      });

      if (!response.ok) {
        throw new Error(`Failed to save sessions: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  async loadSessions(): Promise<UserSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`);
      if (!response.ok) {
        throw new Error(`Failed to load sessions: ${response.status}`);
      }

      const data = await response.json();
      return data.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }
}

export const localStorageDB = new LocalStorageDB();
