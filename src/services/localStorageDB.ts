
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
  private readonly SESSIONS_KEY = 'interview_sessions';
  private readonly CHAT_HISTORY_KEY = 'chat_history';

  // Chat History Methods
  saveChatHistory(chatHistory: ChatHistory): void {
    try {
      const histories = this.getAllChatHistories();
      const existingIndex = histories.findIndex(h => h.id === chatHistory.id);
      
      if (existingIndex >= 0) {
        histories[existingIndex] = chatHistory;
      } else {
        histories.push(chatHistory);
      }
      
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(histories));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  getAllChatHistories(): ChatHistory[] {
    try {
      const data = localStorage.getItem(this.CHAT_HISTORY_KEY);
      if (!data) return [];
      
      return JSON.parse(data).map((history: any) => ({
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

  getChatHistory(id: string): ChatHistory | null {
    const histories = this.getAllChatHistories();
    return histories.find(h => h.id === id) || null;
  }

  deleteChatHistory(id: string): void {
    try {
      const histories = this.getAllChatHistories();
      const filtered = histories.filter(h => h.id !== id);
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete chat history:', error);
    }
  }

  // Sessions Methods (enhanced from existing sessionService)
  saveSessions(sessions: UserSession[]): void {
    try {
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  loadSessions(): UserSession[] {
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY);
      if (!data) return [];
      
      return JSON.parse(data).map((session: any) => ({
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
