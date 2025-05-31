
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, UserSession, Question } from '../types';
import { questions, domains } from '../data/questions';
import { sessionService } from '../services/sessionService';
import { dashboardService } from '../services/dashboardService';
import QuestionCard from './QuestionCard';
import ScoreDisplay from './ScoreDisplay';
import Dashboard from './Dashboard';

const ChatInterface: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [userHistory, setUserHistory] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<'fresher' | 'experienced' | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      text: 'Hello! Welcome to the AI Interview Assessment Platform. I\'m here to help guide you through your assessment journey. Please select your experience level and domain from the left panel to begin your assessment.',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    sessionService.loadFromLocalStorage();
    dashboardService.loadFromLocalStorage();
  }, []);

  const getQuestionsByLevelAndDomain = (level: 'fresher' | 'experienced', domain: string): Question[] => {
    return questions.filter(q => q.level === level && q.domain === domain);
  };

  const getRandomQuestions = (questionPool: Question[], count: number): Question[] => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simple bot responses
    setTimeout(() => {
      let botResponse = '';
      const lowerInput = inputMessage.toLowerCase();
      
      if (lowerInput.includes('help') || lowerInput.includes('how')) {
        botResponse = 'I can help you with the assessment process! First, select your experience level (Fresher or Experienced) and choose a domain from the left panel. Then click "Start Assessment" to begin your 5-question test.';
      } else if (lowerInput.includes('domain') || lowerInput.includes('field')) {
        botResponse = 'We have 10 computer software domains available: Web Development, Mobile Development, Data Science, Machine Learning, DevOps, Cybersecurity, Database Management, Cloud Computing, Software Testing, and UI/UX Design.';
      } else if (lowerInput.includes('time') || lowerInput.includes('duration')) {
        botResponse = 'Each question has a 30-second time limit. The complete assessment with 5 questions typically takes around 3-5 minutes including reading time.';
      } else if (lowerInput.includes('score') || lowerInput.includes('result')) {
        botResponse = 'After completing the assessment, you\'ll see your score, eligibility status, and detailed results. Your performance history is also saved for future reference.';
      } else {
        botResponse = 'Thank you for your message! I\'m here to assist you with the assessment. Please select your experience level and domain to get started, or ask me any questions about the process.';
      }

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleStartAssessment = () => {
    if (!selectedLevel || !selectedDomain) {
      const warningMessage: ChatMessageType = {
        id: Date.now().toString(),
        text: 'Please select both experience level and domain before starting the assessment.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    const questionPool = getQuestionsByLevelAndDomain(selectedLevel, selectedDomain);
    if (questionPool.length === 0) {
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        text: `Sorry, no questions available for ${selectedLevel} level in ${selectedDomain} domain.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const selectedQuestions = getRandomQuestions(questionPool, 5);
    setAvailableQuestions(selectedQuestions);
    
    const session = sessionService.createSession(selectedLevel, selectedDomain);
    setCurrentSession(session);
    setCurrentQuestion(selectedQuestions[0]);

    const startMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: `Great! Starting your ${selectedLevel} level assessment in ${selectedDomain}. You'll have 30 seconds per question. Good luck!`,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, startMessage]);
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

        const completionMessage: ChatMessageType = {
          id: Date.now().toString(),
          text: 'Congratulations! You have completed the assessment. Your results are displayed below.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, completionMessage]);
      }
      setCurrentQuestion(null);
    }
  };

  const handleRestart = () => {
    setCurrentSession(null);
    setCurrentQuestion(null);
    setAvailableQuestions([]);
    setUserHistory(null);
    setSelectedLevel(null);
    setSelectedDomain('');
    
    const restartMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: 'Ready for a new assessment! Please select your experience level and domain to begin.',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, restartMessage]);
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
            ← Back to Assessment
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
          🤖 AI Interview Assessment Platform
        </h1>
        <button
          onClick={toggleDashboard}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          📊 Admin Dashboard
        </button>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {/* Top Section - Chatbot */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 h-[400px]">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-t-3xl">
              <h3 className="text-white font-semibold text-lg flex items-center">
                🤖 AI Assessment Assistant
              </h3>
              <p className="text-blue-100 text-sm">Your personal guide through the assessment process</p>
            </div>

            <div className="h-[280px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about the assessment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="w-full max-w-7xl mx-auto flex gap-6">
          {/* Left Sidebar - Selection Panel */}
          <div className="w-80 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-6 h-fit">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  🎯 Assessment Setup
                </h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Experience Level:
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedLevel('fresher')}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                      selectedLevel === 'fresher'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🌱 Fresher (0-2 years)
                  </button>
                  <button
                    onClick={() => setSelectedLevel('experienced')}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                      selectedLevel === 'experienced'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🚀 Experienced (2+ years)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Domain Selection:
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="">Choose your domain</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartAssessment}
                disabled={!selectedLevel || !selectedDomain || currentSession}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg transform hover:scale-105"
              >
                {currentSession ? '📝 Assessment in Progress' : '🚀 Start Assessment'}
              </button>
            </div>
          </div>

          {/* Right Side - Assessment Section */}
          <div className="flex-1">
            {(currentQuestion || (currentSession && !currentQuestion)) && (
              <div>
                {currentQuestion ? (
                  <QuestionCard
                    question={currentQuestion}
                    questionNumber={currentSession?.currentQuestionIndex || 0}
                    totalQuestions={availableQuestions.length}
                    onAnswer={handleAnswerSubmit}
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
      </div>
    </div>
  );
};

export default ChatInterface;
