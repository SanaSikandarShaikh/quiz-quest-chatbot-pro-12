
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

  const handleStartAssessment = () => {
    if (!selectedLevel || !selectedDomain) return;

    const questionPool = getQuestionsByLevelAndDomain(selectedLevel, selectedDomain);
    if (questionPool.length === 0) {
      alert(`Sorry, no questions available for ${selectedLevel} level in ${selectedDomain} domain.`);
      return;
    }

    const selectedQuestions = getRandomQuestions(questionPool, 5);
    setAvailableQuestions(selectedQuestions);
    
    const session = sessionService.createSession(selectedLevel, selectedDomain);
    setCurrentSession(session);
    setCurrentQuestion(selectedQuestions[0]);
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
    setSelectedLevel(null);
    setSelectedDomain('');
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
        {/* Chat Interface - Compact Size */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 h-[300px]">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-t-3xl">
              <h3 className="text-white font-semibold text-sm flex items-center">
                🤖 AI Assessment Assistant
              </h3>
              <p className="text-blue-100 text-xs">Select your level and domain to start the assessment</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level:
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedLevel('fresher')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedLevel === 'fresher'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Fresher
                    </button>
                    <button
                      onClick={() => setSelectedLevel('experienced')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedLevel === 'experienced'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Experienced
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain:
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a domain</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleStartAssessment}
                  disabled={!selectedLevel || !selectedDomain}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-600 transition-all"
                >
                  🚀 Start Assessment
                </button>
              </div>
            </div>
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
  );
};

export default ChatInterface;
