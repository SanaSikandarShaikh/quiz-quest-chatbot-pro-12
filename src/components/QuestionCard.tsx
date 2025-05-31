
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Clock, Award, Sparkles, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string, timeSpent: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
}) => {
  const [answer, setAnswer] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(30); // 30 seconds timer

  // Reset state when question changes
  useEffect(() => {
    setAnswer('');
    setTimeSpent(0);
    setIsSubmitted(false);
    setQuestionTimer(30); // Reset timer to 30 seconds
    console.log('Question changed, timer reset to 30 seconds');
  }, [question.id]);

  // Main timer for tracking time spent
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isSubmitted) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Question time limit timer (30 seconds countdown)
  useEffect(() => {
    const questionTimerInterval = setInterval(() => {
      if (!isSubmitted && questionTimer > 0) {
        setQuestionTimer(prev => {
          const newTime = prev - 1;
          console.log('Timer countdown:', newTime);
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(questionTimerInterval);
  }, [isSubmitted, questionTimer]);

  // Auto-skip question when timer reaches 0
  useEffect(() => {
    if (questionTimer === 0 && !isSubmitted) {
      console.log('Time is up! Auto-skipping question...');
      handleAutoSkip();
    }
  }, [questionTimer, isSubmitted]);

  const handleAutoSkip = () => {
    console.log('Auto-skipping question due to timeout');
    // Submit empty answer when time runs out
    onAnswer(answer.trim() || "No answer provided (time limit exceeded)", timeSpent);
    setIsSubmitted(true);
    // Auto-reset after a short delay to prepare for next question
    setTimeout(() => {
      setIsSubmitted(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      console.log('Submitting answer manually');
      onAnswer(answer, timeSpent);
      setIsSubmitted(true);
      // Auto-reset after a short delay to prepare for next question
      setTimeout(() => {
        setIsSubmitted(false);
      }, 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (questionTimer <= 10) return "text-red-600 bg-red-100";
    if (questionTimer <= 20) return "text-orange-600 bg-orange-100";
    return "text-green-600 bg-green-100";
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 p-8 w-full min-h-[500px] overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 -m-8 mb-6 p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-base">Question {questionNumber + 1} of {totalQuestions}</span>
            </div>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-medium">
              {question.domain}
            </span>
            <span className={`px-3 py-2 rounded-full text-sm font-medium ${
              question.level === 'fresher' 
                ? 'bg-green-400/30 text-green-100' 
                : 'bg-orange-400/30 text-orange-100'
            }`}>
              {question.level}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-white/90">
            {/* Question Timer - 30 seconds countdown */}
            <div className={`flex items-center space-x-2 backdrop-blur-sm px-4 py-2 rounded-full font-bold ${getTimerColor()} text-black ${questionTimer <= 10 ? 'animate-pulse' : ''}`}>
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-base">{questionTimer}s</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeSpent)}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
              <Award className="w-4 h-4" />
              <span className="font-semibold text-sm">{question.points} pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
          {question.question}
        </h3>
        {questionTimer <= 10 && !isSubmitted && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold text-base">Time Warning: Only {questionTimer} seconds remaining!</span>
            </div>
          </div>
        )}
      </div>

      {!isSubmitted ? (
        <div className="space-y-6">
          <div className="relative">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your detailed answer here... Be specific and comprehensive!"
              className="min-h-[200px] text-lg border-2 border-purple-200 focus:border-purple-500 transition-all duration-300 rounded-2xl p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 resize-none"
              disabled={questionTimer === 0}
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-500">
              {answer.length} characters
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-base text-gray-600 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-full">
              💡 <span className="font-medium">Tip:</span> Include key concepts and examples in your answer
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || questionTimer === 0}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold disabled:opacity-50 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-3 text-base"
            >
              <Zap className="w-5 h-5" />
              <span>Submit Answer</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-green-800 font-bold text-xl mb-3">
              {questionTimer === 0 ? "Time's Up! Moving to Next Question..." : "Answer Submitted!"}
            </h4>
            <p className="text-green-700 font-medium text-base">
              {questionTimer === 0 
                ? "Your answer has been recorded. Loading next question..." 
                : "Your answer has been recorded. Loading next question..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
