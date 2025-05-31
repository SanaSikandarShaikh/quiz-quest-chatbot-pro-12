
export interface UserData {
  id: string;
  fullName: string;
  email: string;
  password: string;
  registrationDate: string;
  sessions: any[];
  totalAssessments: number;
  bestScore: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lastLoginDate: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  userName: string;
  loginTime: string;
  ipAddress?: string;
  success: boolean;
}

class PersistenceService {
  private readonly USERS_KEY = 'assessment_users_db';
  private readonly LOGIN_HISTORY_KEY = 'assessment_login_history';
  private readonly SESSIONS_KEY = 'assessment_sessions_db';

  // User Management
  saveUser(userData: UserData): void {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.email === userData.email);
    
    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  getUserByEmail(email: string): UserData | null {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  getAllUsers(): UserData[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load users:', error);
      return [];
    }
  }

  // Login History
  saveLoginAttempt(attempt: LoginAttempt): void {
    const history = this.getLoginHistory();
    history.push(attempt);
    localStorage.setItem(this.LOGIN_HISTORY_KEY, JSON.stringify(history));
  }

  getLoginHistory(): LoginAttempt[] {
    try {
      const data = localStorage.getItem(this.LOGIN_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load login history:', error);
      return [];
    }
  }

  // Session Data
  saveSessions(sessions: any[]): void {
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  getSessions(): any[] {
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  // Clear all data (for testing purposes)
  clearAllData(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.LOGIN_HISTORY_KEY);
    localStorage.removeItem(this.SESSIONS_KEY);
  }
}

export const persistenceService = new PersistenceService();
