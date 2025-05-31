
import React, { useState } from 'react';
import { UserSession, Question } from '../types';
import { Trophy, Target, Clock, TrendingUp, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Sparkles, Award, History, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScoreDisplayProps {
  session: UserSession;
  availableQuestions: Question[];
  onRestart: () => void;
  userHistory?: any;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ session, availableQuestions, onRestart, userHistory }) => {
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const totalQuestions = session.answers.length;
  const correctAnswers = session.answers.filter(answer => answer.isCorrect).length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const totalTime = session.endTime && session.startTime 
    ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : 0;

  const getEligibilityStatus = () => {
    if (percentage >= 80) return { 
      status: "Highly Eligible", 
      message: "Outstanding! You've demonstrated exceptional knowledge and are highly qualified for this role.",
      color: "text-green-600",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
      borderColor: "border-green-300",
      icon: CheckCircle
    };
    if (percentage >= 60) return { 
      status: "Eligible", 
      message: "Well done! You've shown good understanding and meet the requirements for this role.",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
      borderColor: "border-blue-300",
      icon: CheckCircle
    };
    if (percentage >= 40) return { 
      status: "Partially Eligible", 
      message: "You have potential but may need additional preparation. Consider reviewing the topics and trying again.",
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
      borderColor: "border-yellow-300",
      icon: AlertCircle
    };
    return { 
      status: "Not Eligible", 
      message: "More preparation is needed. We recommend studying the core concepts and retaking the assessment.",
      color: "text-red-600",
      bgColor: "bg-gradient-to-r from-red-50 to-pink-50",
      borderColor: "border-red-300",
      icon: XCircle
    };
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding Performance! 🎉", color: "text-green-600" };
    if (percentage >= 75) return { message: "Great Job! 👏", color: "text-blue-600" };
    if (percentage >= 60) return { message: "Good Effort! 👍", color: "text-yellow-600" };
    return { message: "Keep Practicing! 💪", color: "text-orange-600" };
  };

  const eligibility = getEligibilityStatus();
  const performance = getPerformanceMessage();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getQuestionById = (questionId: number): Question | undefined => {
    return availableQuestions.find(q => q.id === questionId);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <Sparkles className="absolute top-0 right-1/3 w-4 h-4 text-yellow-400 animate-bounce" />
          <Sparkles className="absolute bottom-0 left-1/3 w-3 h-3 text-purple-400 animate-bounce delay-300" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Assessment Complete!
        </h2>
        <p className={`text-lg font-bold ${performance.color} mb-3`}>{performance.message}</p>
        <p className="text-gray-600 font-medium text-sm">You have successfully completed all {totalQuestions} questions</p>
      </div>

      {/* Eligibility Status - Compact */}
      <div className={`${eligibility.bgColor} ${eligibility.borderColor} border-2 rounded-xl p-4 mb-6 shadow-md max-w-2xl mx-auto`}>
        <div className="flex items-center justify-center mb-3">
          <eligibility.icon className={`w-6 h-6 ${eligibility.color} mr-2`} />
          <h3 className={`text-xl font-bold ${eligibility.color}`}>
            {eligibility.status}
          </h3>
        </div>
        <p className={`text-center ${eligibility.color} font-semibold text-sm px-4`}>
          {eligibility.message}
        </p>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 text-center shadow-md border border-purple-200">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-purple-600 mb-1">{session.totalScore}</h3>
          <p className="text-gray-600 font-medium text-xs">Total Score</p>
          <p className="text-xs text-gray-500">out of {totalQuestions * 10}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 text-center shadow-md border border-green-200">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-1">{percentage}%</h3>
          <p className="text-gray-600 font-medium text-xs">Accuracy</p>
          <p className="text-xs text-gray-500">Pass: 60%</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center shadow-md border border-blue-200">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-blue-600 mb-1">{correctAnswers}/{totalQuestions}</h3>
          <p className="text-gray-600 font-medium text-xs">Correct</p>
          <p className="text-xs text-gray-500">Questions</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center shadow-md border border-orange-200">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-orange-600 mb-1">{formatTime(totalTime)}</h3>
          <p className="text-gray-600 font-medium text-xs">Time Taken</p>
          <p className="text-xs text-gray-500">Avg: {formatTime(Math.round(totalTime / totalQuestions))}</p>
        </div>
      </div>

      {/* User History Section - Compact */}
      {userHistory && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-6 border border-indigo-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <History className="w-5 h-5 mr-2 text-indigo-500" />
              Your Assessment History
            </h3>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="flex items-center gap-2 border-2 border-indigo-300 hover:bg-indigo-50 rounded-lg px-4 py-2 text-sm"
            >
              {showHistory ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showHistory ? 'Hide' : 'Show'}
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
              <h4 className="text-xl font-bold text-indigo-600">{userHistory.totalSessions}</h4>
              <p className="text-gray-600 font-medium text-xs">Total Tests</p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
              <h4 className="text-xl font-bold text-green-600">{userHistory.bestScore}</h4>
              <p className="text-gray-600 font-medium text-xs">Best Score</p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
              <h4 className="text-xl font-bold text-blue-600">{userHistory.averageScore}</h4>
              <p className="text-gray-600 font-medium text-xs">Average Score</p>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
              <h4 className="text-xl font-bold text-purple-600">{userHistory.accuracy}%</h4>
              <p className="text-gray-600 font-medium text-xs">Overall Accuracy</p>
            </div>
          </div>

          {showHistory && userHistory.sessions && (
            <div className="space-y-3">
              <h4 className="font-bold text-base text-gray-800">Previous Sessions:</h4>
              {userHistory.sessions.slice(-3).reverse().map((prevSession: any, index: number) => (
                <div key={prevSession.id} className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <h5 className="font-semibold text-sm">
                        Session {userHistory.sessions.length - index}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {prevSession.domain} • {prevSession.level} • {formatDate(prevSession.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-purple-600">{prevSession.totalScore} pts</div>
                      <div className="text-xs text-gray-600">
                        {prevSession.answers.filter((a: any) => a.isCorrect).length}/{prevSession.answers.length} correct
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Accuracy: {Math.round((prevSession.answers.filter((a: any) => a.isCorrect).length / prevSession.answers.length) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assessment Details - Compact */}
      <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-5 mb-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
          Assessment Details
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
            <span className="font-semibold text-gray-600 text-xs">Level:</span>
            <span className="block capitalize font-medium text-sm">{session.level}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
            <span className="font-semibold text-gray-600 text-xs">Domain:</span>
            <span className="block font-medium text-sm">{session.domain}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
            <span className="font-semibold text-gray-600 text-xs">Questions:</span>
            <span className="block font-medium text-sm">{totalQuestions} / 5</span>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm text-center">
            <span className="font-semibold text-gray-600 text-xs">Status:</span>
            <span className={`block font-bold text-sm ${eligibility.color}`}>{eligibility.status}</span>
          </div>
        </div>
      </div>

      {/* Answer Review Section - Compact */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-purple-500" />
            Answer Review:
          </h3>
          <Button
            onClick={() => setShowDetailedReview(!showDetailedReview)}
            variant="outline"
            className="flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 rounded-lg px-4 py-2 text-sm"
          >
            {showDetailedReview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDetailedReview ? 'Hide' : 'Show'}
          </Button>
        </div>

        <div className="space-y-4">
          {session.answers.map((answer, index) => {
            const question = getQuestionById(answer.questionId);
            return (
              <div key={answer.questionId} className={`p-4 rounded-xl border-l-4 shadow-md ${
                answer.isCorrect 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">Question {index + 1} of 5</span>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      answer.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                    <span className="text-sm text-gray-600 font-semibold bg-white px-3 py-1 rounded-full">+{answer.points} pts</span>
                  </div>
                </div>
                
                {showDetailedReview && question && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Question:</p>
                      <p className="text-gray-600 bg-white p-2 rounded border">
                        {question.question}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Your Answer:</p>
                      <p className="text-gray-600 bg-white p-2 rounded border">
                        {answer.userAnswer}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Correct Answer:</p>
                      <p className="text-gray-600 bg-white p-2 rounded border">
                        {question.correctAnswer}
                      </p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Domain: {question.domain}</span>
                      <span>Level: {question.level}</span>
                      <span>Time: {formatTime(answer.timeSpent)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRestart}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
        >
          🚀 Take New Assessment
        </Button>
        {percentage < 60 && (
          <Button
            onClick={onRestart}
            variant="outline"
            className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
          >
            🔄 Retake Assessment
          </Button>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;
