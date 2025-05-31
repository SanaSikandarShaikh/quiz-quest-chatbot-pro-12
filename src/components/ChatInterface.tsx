import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, UserSession, Question } from '../types';
import { questions, domains } from '../data/questions';
import { sessionService } from '../services/sessionService';
import { dashboardService } from '../services/dashboardService';
import GeminiChatInterface from './GeminiChatInterface';
import QuestionCard from './QuestionCard';
import ScoreDisplay from './ScoreDisplay';
import Dashboard from './Dashboard';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [userHistory, setUserHistory] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionService.loadFromLocalStorage();
    dashboardService.loadFromLocalStorage();
    
    setMessages([{
      id: '1',
      type: 'bot',
      content: "👋 Welcome! I'm here to help you prepare for your interview. Let's start by selecting your experience level and domain for the assessment.",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getQuestionsByLevelAndDomain = (level: 'fresher' | 'experienced', domain: string): Question[] => {
    return questions.filter(q => q.level === level && q.domain === domain);
  };

  const getRandomQuestions = (questionPool: Question[], count: number): Question[] => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleStartAssessment = (level: 'fresher' | 'experienced', domain: string) => {
    const questionPool = getQuestionsByLevelAndDomain(level, domain);
    if (questionPool.length === 0) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: `Sorry, no questions available for ${level} level in ${domain} domain.`,
        timestamp: new Date()
      }]);
      return;
    }

    const selectedQuestions = getRandomQuestions(questionPool, 5);
    setAvailableQuestions(selectedQuestions);
    
    const session = sessionService.createSession(level, domain);
    setCurrentSession(session);
    setCurrentQuestion(selectedQuestions[0]);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'bot',
      content: `Great! Starting your ${level} level assessment for ${domain}. You'll have 5 questions to answer. Let's begin!`,
      timestamp: new Date()
    }]);
  };

  const handleAnswerSubmit = (answer: string, timeSpent: number) => {
    if (!currentSession || !currentQuestion) return;

    const evaluatedAnswer = sessionService.evaluateAnswer(answer, currentQuestion.correctAnswer, currentQuestion);
    evaluatedAnswer.timeSpent = timeSpent;

    const updatedSession = sessionService.addAnswer(currentSession.id, evaluatedAnswer);
    if (!updatedSession) return;

    setCurrentSession(updatedSession);

    if (updatedSession.currentQuestionIndex < availableQuestions.length) {
      setCurrentQuestion(availableQuestions[updatedSession.currentQuestionIndex]);
    } else {
      // Assessment completed
      const completedSession = sessionService.updateSession(updatedSession.id, { endTime: new Date() });
      if (completedSession) {
        setCurrentSession(completedSession);
        
        // Get user info from localStorage
        const registeredUser = JSON.parse(localStorage.getItem('registeredUser') || '{}');
        
        // Update user progress in dashboard
        dashboardService.updateUserProgress(completedSession, registeredUser.fullName, registeredUser.email);
        
        // Load user history for display
        const userProgress = dashboardService.getUserProgress(registeredUser.email);
        setUserHistory(userProgress);
      }
      setCurrentQuestion(null);
    }
  };

  const handleRestart = () => {
    setCurrentSession(null);
    setCurrentQuestion(null);
    setAvailableQuestions([]);
    setUserHistory(null);
    setMessages([{
      id: Date.now().toString(),
      type: 'bot',
      content: "Ready for another assessment? Please select your experience level and domain.",
      timestamp: new Date()
    }]);
  };

  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="p-4">
          <button
            onClick={toggleDashboard}
            className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            ← Back to Chat
          </button>
          <Dashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header with Dashboard button */}
      <div className="p-4 flex justify-between items-center bg-white/90 backdrop-blur-sm border-b border-purple-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          🤖 AI Interview Assistant
        </h1>
        <button
          onClick={toggleDashboard}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          📊 View Dashboard
        </button>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {/* Chat Interface */}
        <div className="w-full max-w-6xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 h-[600px]">
            <GeminiChatInterface
              messages={messages}
              onStartAssessment={handleStartAssessment}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </div>

        {/* Assessment Section */}
        {(currentQuestion || (currentSession && !currentQuestion)) && (
          <div className="w-full max-w-6xl mx-auto">
            {currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentSession?.currentQuestionIndex || 0}
                totalQuestions={availableQuestions.length}
                onAnswerSubmit={handleAnswerSubmit}
              />
            ) : (
              <ScoreDisplay
                session={currentSession!}
                availableQuestions={availableQuestions}
                onRestart={handleRestart}
                userHistory={userHistory}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
