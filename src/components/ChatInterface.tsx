import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, UserSession, Question } from '../types';
import { questions, domains } from '../data/questions';
import { sessionService } from '../services/sessionService';
import ChatMessage from './ChatMessage';
import QuestionCard from './QuestionCard';
import ScoreDisplay from './ScoreDisplay';
import GeminiChatInterface from './GeminiChatInterface';
import { Button } from '@/components/ui/button';
import { Send, RotateCcw, Sparkles, Bot, BookOpen } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [mode, setMode] = useState<'interview' | 'gemini'>('interview');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [selectedLevel, setSelectedLevel] = useState<'fresher' | 'experienced' | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const TOTAL_QUESTIONS = 5;

  useEffect(() => {
    if (mode === 'interview') {
      sessionService.loadFromLocalStorage();
      addBotMessage("Hi! 👋 Welcome to the Interview Questions Generator! I'm here to help you practice interview questions. Let's start by selecting your experience level.", true);
    }
  }, [mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (content: string, isTyping: boolean = false) => {
    const message: ChatMessageType = {
      id: `bot_${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      isTyping,
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessageType = {
      id: `user_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const addSystemMessage = (content: string) => {
    const message: ChatMessageType = {
      id: `system_${Date.now()}`,
      type: 'system',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleLevelSelection = (level: 'fresher' | 'experienced') => {
    setSelectedLevel(level);
    addUserMessage(`I'm a ${level}`);
    setTimeout(() => {
      addBotMessage(`Great! You've selected ${level} level. Now, please choose a programming language or domain you'd like to be assessed on:`, true);
    }, 500);
  };

  const handleDomainSelection = (domain: string) => {
    setSelectedDomain(domain);
    addUserMessage(`I want to be assessed on ${domain}`);
    
    setTimeout(() => {
      if (selectedLevel) {
        startSession(selectedLevel, domain);
      }
    }, 500);
  };

  const startSession = (level: 'fresher' | 'experienced', domain: string) => {
    const session = sessionService.createSession(level, domain);
    setCurrentSession(session);
    
    let questionsForSession = questions.filter(q => 
      q.level === level && (domain === 'All' || q.domain === domain)
    );
    
    if (questionsForSession.length === 0) {
      addBotMessage("Sorry, no questions available for this combination. Please try a different selection.");
      return;
    }

    // Ensure we have exactly 5 questions
    questionsForSession = questionsForSession
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL_QUESTIONS);
    
    // If we don't have enough questions, repeat some randomly
    while (questionsForSession.length < TOTAL_QUESTIONS && questionsForSession.length > 0) {
      const additionalQuestions = questions.filter(q => 
        q.level === level && (domain === 'All' || q.domain === domain)
      ).sort(() => Math.random() - 0.5);
      questionsForSession = [...questionsForSession, ...additionalQuestions].slice(0, TOTAL_QUESTIONS);
    }
    
    setAvailableQuestions(questionsForSession);
    const firstQuestion = questionsForSession[0];
    setCurrentQuestion(firstQuestion);
    setGameState('playing');
    
    addSystemMessage(`Starting ${level} level ${domain} assessment - 5 questions total`);
    setTimeout(() => {
      addBotMessage(`Perfect! Let's begin your ${level} level ${domain} assessment. You will answer exactly 5 carefully selected questions to evaluate your skills. Each question is worth 10 points, for a total of 50 possible points. Take your time and answer thoughtfully. Ready? Here's question 1! 🚀`, true);
    }, 1000);
  };

  const handleAnswer = (answer: string, timeSpent: number) => {
    if (!currentSession || !currentQuestion) return;

    const evaluation = sessionService.evaluateAnswer(answer, currentQuestion.correctAnswer, currentQuestion);
    evaluation.timeSpent = timeSpent;
    
    const updatedSession = sessionService.addAnswer(currentSession.id, evaluation);
    if (!updatedSession) return;

    setCurrentSession(updatedSession);
    addUserMessage(answer);

    setTimeout(() => {
      const currentQuestionNumber = updatedSession.answers.length;
      const totalQuestions = availableQuestions.length;
      
      const resultMessage = evaluation.isCorrect 
        ? `✅ Correct! You earned ${evaluation.points} points. Progress: ${currentQuestionNumber}/${totalQuestions}`
        : `❌ Incorrect. The correct answer concept was: "${currentQuestion.correctAnswer}". Progress: ${currentQuestionNumber}/${totalQuestions}`;
      
      addBotMessage(resultMessage, true);

      setTimeout(() => {
        // Check if there are more questions
        if (currentQuestionNumber < totalQuestions) {
          const nextQuestion = availableQuestions[currentQuestionNumber];
          setCurrentQuestion(nextQuestion);
          addBotMessage(`Moving to question ${currentQuestionNumber + 1} of ${totalQuestions}. Keep going! 📝`, true);
        } else {
          finishSession(updatedSession);
        }
      }, 1500);
    }, 1000);
  };

  const finishSession = (session: UserSession) => {
    const finishedSession = sessionService.updateSession(session.id, { endTime: new Date() });
    if (finishedSession) {
      setCurrentSession(finishedSession);
    }
    setGameState('finished');
    setCurrentQuestion(null);
    
    const correctAnswers = session.answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctAnswers / 5) * 100);
    
    setTimeout(() => {
      addBotMessage(`🎉 Assessment Complete! You've answered all 5 questions. 

📊 Your Results:
- Score: ${session.totalScore}/50 points
- Accuracy: ${percentage}%
- Correct Answers: ${correctAnswers}/5

Based on your performance, we'll now determine your eligibility for the role. Please review your detailed results below!`, true);
    }, 500);
  };

  const restartChat = () => {
    setMessages([]);
    setCurrentSession(null);
    setCurrentQuestion(null);
    setGameState('setup');
    setSelectedLevel(null);
    setSelectedDomain(null);
    setAvailableQuestions([]);
    
    setTimeout(() => {
      addBotMessage("Hi! 👋 Welcome back to the Interview Assessment Platform! Ready for another assessment? Let's select your experience level to begin.", true);
    }, 500);
  };

  const handleModeSwitch = (newMode: 'interview' | 'gemini') => {
    setMode(newMode);
    if (newMode === 'interview') {
      // Reset interview state
      setMessages([]);
      setCurrentSession(null);
      setCurrentQuestion(null);
      setGameState('setup');
      setSelectedLevel(null);
      setSelectedDomain(null);
      setAvailableQuestions([]);
    }
  };

  // If in Gemini mode, render the Gemini interface
  if (mode === 'gemini') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4 space-x-4">
                <Button
                  onClick={() => handleModeSwitch('interview')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Interview Mode</span>
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center space-x-2"
                  disabled
                >
                  <Bot className="w-5 h-5" />
                  <span>Gemini Chat</span>
                </Button>
              </div>
            </div>
            <GeminiChatInterface />
          </div>
        </div>
      </div>
    );
  }

  // Interview mode rendering (existing code)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4 space-x-4">
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center space-x-2"
                disabled
              >
                <BookOpen className="w-5 h-5" />
                <span>Interview Mode</span>
              </Button>
              <Button
                onClick={() => handleModeSwitch('gemini')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Bot className="w-5 h-5" />
                <span>Gemini Chat</span>
              </Button>
            </div>
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Interview Mastery
              </h1>
              <Sparkles className="w-8 h-8 text-purple-600 ml-3" />
            </div>
            <p className="text-gray-600 text-lg font-medium">Master your skills with AI-powered interview questions</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-white/70 backdrop-blur-sm rounded-full px-6 py-2 border border-purple-200 shadow-lg">
                <span className="text-purple-700 font-semibold">✨ Quick • Smart • Effective ✨</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 h-[600px] flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                  <h3 className="text-white font-semibold text-lg">Assessment Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Selection Buttons */}
                {gameState === 'setup' && (
                  <div className="p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    {!selectedLevel ? (
                      <div className="space-y-4">
                        <p className="text-gray-700 font-semibold text-center">Choose your experience level:</p>
                        <div className="flex gap-4 justify-center">
                          <Button
                            onClick={() => handleLevelSelection('fresher')}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            🌱 Fresher
                          </Button>
                          <Button
                            onClick={() => handleLevelSelection('experienced')}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            🚀 Experienced
                          </Button>
                        </div>
                      </div>
                    ) : !selectedDomain ? (
                      <div className="space-y-4">
                        <p className="text-gray-700 font-semibold text-center">Select a programming language or domain:</p>
                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                          {domains.map((domain) => (
                            <Button
                              key={domain}
                              onClick={() => handleDomainSelection(domain)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              {domain}
                            </Button>
                          ))}
                          <Button
                            onClick={() => handleDomainSelection('All')}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-semibold text-sm col-span-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            🎯 All Domains (Mixed)
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Restart Button */}
                {gameState !== 'setup' && (
                  <div className="p-6 border-t border-purple-100 bg-gradient-to-r from-gray-50 to-gray-100">
                    <Button
                      onClick={restartChat}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Start New Session
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Question/Score Section */}
            <div className="lg:col-span-1">
              {gameState === 'playing' && currentQuestion && currentSession && (
                <QuestionCard
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  questionNumber={currentSession.answers.length + 1}
                  totalQuestions={availableQuestions.length}
                />
              )}

              {gameState === 'finished' && currentSession && (
                <ScoreDisplay
                  session={currentSession}
                  availableQuestions={availableQuestions}
                  onRestart={restartChat}
                />
              )}

              {gameState === 'setup' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">How it works</h3>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                      <p className="font-medium">Choose your experience level (Fresher or Experienced)</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                      <p className="font-medium">Select a programming language or domain</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                      <p className="font-medium">Answer 5 focused questions like a real interview</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                      <p className="font-medium">Get instant feedback and see correct answers</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <p className="text-center text-yellow-800 font-semibold">⚡ Quick 5-minute assessment ⚡</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
