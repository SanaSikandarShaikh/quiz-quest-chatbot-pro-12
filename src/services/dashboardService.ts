
import { UserSession, UserAnswer, Question } from '../types';

export interface UserProgress {
  userId: string;
  userName: string;
  email: string;
  sessions: UserSession[];
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lastLoginDate: Date;
  registrationDate: Date;
}

export interface LoginHistory {
  id: string;
  email: string;
  userName: string;
  loginTime: Date;
  ipAddress?: string;
}

class DashboardService {
  private loginHistory: LoginHistory[] = [];
  private userProgress: Map<string, UserProgress> = new Map();

  // Track user login
  trackLogin(email: string, userName: string, ipAddress?: string): void {
    const loginRecord: LoginHistory = {
      id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      userName,
      loginTime: new Date(),
      ipAddress
    };

    this.loginHistory.push(loginRecord);
    this.saveToLocalStorage();
    console.log('Login tracked:', loginRecord);
  }

  // Update user progress after completing a session
  updateUserProgress(session: UserSession, userName: string, email: string): void {
    const userId = email; // Using email as unique identifier
    
    let progress = this.userProgress.get(userId);
    
    if (!progress) {
      // Create new progress record
      const registeredUser = localStorage.getItem('registeredUser');
      const registrationDate = registeredUser 
        ? new Date(JSON.parse(registeredUser).registrationDate) 
        : new Date();
      
      progress = {
        userId,
        userName,
        email,
        sessions: [],
        totalSessions: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        lastLoginDate: new Date(),
        registrationDate
      };
    }

    // Add session to progress
    progress.sessions.push(session);
    progress.totalSessions = progress.sessions.length;
    progress.lastLoginDate = new Date();

    // Calculate statistics
    const allScores = progress.sessions.map(s => s.totalScore);
    progress.bestScore = Math.max(...allScores);
    progress.averageScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    // Calculate question statistics
    progress.totalQuestions = progress.sessions.reduce((total, s) => total + s.answers.length, 0);
    progress.correctAnswers = progress.sessions.reduce((total, s) => 
      total + s.answers.filter(a => a.isCorrect).length, 0);
    progress.accuracy = progress.totalQuestions > 0 
      ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100) 
      : 0;

    this.userProgress.set(userId, progress);
    this.saveToLocalStorage();
    console.log('User progress updated:', progress);
  }

  // Get all user progress records
  getAllUserProgress(): UserProgress[] {
    return Array.from(this.userProgress.values());
  }

  // Get login history
  getLoginHistory(): LoginHistory[] {
    return this.loginHistory.sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime());
  }

  // Get user progress by email
  getUserProgress(email: string): UserProgress | undefined {
    return this.userProgress.get(email);
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('dashboard_login_history', JSON.stringify(this.loginHistory));
      localStorage.setItem('dashboard_user_progress', JSON.stringify(Array.from(this.userProgress.entries())));
    } catch (error) {
      console.error('Failed to save dashboard data:', error);
    }
  }

  // Load from localStorage
  loadFromLocalStorage(): void {
    try {
      // Load login history
      const savedLoginHistory = localStorage.getItem('dashboard_login_history');
      if (savedLoginHistory) {
        this.loginHistory = JSON.parse(savedLoginHistory).map((record: any) => ({
          ...record,
          loginTime: new Date(record.loginTime)
        }));
      }

      // Load user progress
      const savedUserProgress = localStorage.getItem('dashboard_user_progress');
      if (savedUserProgress) {
        const progressArray = JSON.parse(savedUserProgress);
        this.userProgress = new Map(progressArray.map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            lastLoginDate: new Date(value.lastLoginDate),
            registrationDate: new Date(value.registrationDate),
            sessions: value.sessions.map((session: any) => ({
              ...session,
              startTime: new Date(session.startTime),
              endTime: session.endTime ? new Date(session.endTime) : undefined
            }))
          }
        ]));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }
}

export const dashboardService = new DashboardService();
