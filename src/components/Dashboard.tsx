
import React, { useState, useEffect } from 'react';
import { dashboardService, UserProgress, LoginHistory } from '../services/dashboardService';
import { Users, TrendingUp, Clock, Award, Calendar, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Dashboard: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    // Load dashboard data
    dashboardService.loadFromLocalStorage();
    setUserProgress(dashboardService.getAllUserProgress());
    setLoginHistory(dashboardService.getLoginHistory());
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const getStatusColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-100';
    if (accuracy >= 60) return 'text-blue-600 bg-blue-100';
    if (accuracy >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const totalUsers = userProgress.length;
  const totalSessions = userProgress.reduce((sum, user) => sum + user.totalSessions, 0);
  const averageAccuracy = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, user) => sum + user.accuracy, 0) / userProgress.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📊 Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Monitor user progress, sessions, and platform analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-purple-600 text-base">
                <Users className="w-5 h-5 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{totalUsers}</div>
              <p className="text-sm text-gray-600 mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-600 text-base">
                <TrendingUp className="w-5 h-5 mr-2" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{totalSessions}</div>
              <p className="text-sm text-gray-600 mt-1">Completed assessments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-600 text-base">
                <Award className="w-5 h-5 mr-2" />
                Avg. Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{averageAccuracy}%</div>
              <p className="text-sm text-gray-600 mt-1">Platform average</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-orange-600 text-base">
                <Clock className="w-5 h-5 mr-2" />
                Recent Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700">{loginHistory.length}</div>
              <p className="text-sm text-gray-600 mt-1">Login records</p>
            </CardContent>
          </Card>
        </div>

        {/* User Progress Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="w-6 h-6 mr-3 text-purple-600" />
              User Progress & Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Sessions</TableHead>
                    <TableHead className="font-bold">Best Score</TableHead>
                    <TableHead className="font-bold">Avg Score</TableHead>
                    <TableHead className="font-bold">Accuracy</TableHead>
                    <TableHead className="font-bold">Last Login</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userProgress.map((user) => (
                    <React.Fragment key={user.userId}>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="font-medium">{user.userName}</TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {user.totalSessions}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            {user.bestScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                            {user.averageScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(user.accuracy)}`}>
                            {user.accuracy}%
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {formatDate(user.lastLoginDate)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDetails(showDetails === user.userId ? null : user.userId)}
                            className="flex items-center gap-1"
                          >
                            {showDetails === user.userId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showDetails === user.userId ? 'Hide' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {/* Detailed session view */}
                      {showDetails === user.userId && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-6">
                            <div className="space-y-4">
                              <h4 className="font-bold text-lg mb-4">📋 Session History for {user.userName}</h4>
                              <div className="grid gap-4">
                                {user.sessions.map((session, index) => (
                                  <div key={session.id} className="bg-white p-4 rounded-lg border shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h5 className="font-semibold text-base">Session {index + 1}</h5>
                                        <p className="text-sm text-gray-600">
                                          {session.domain} • {session.level} • {formatDate(session.startTime)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-purple-600">{session.totalScore} pts</div>
                                        <div className="text-sm text-gray-600">
                                          {session.answers.filter(a => a.isCorrect).length}/{session.answers.length} correct
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {session.answers.map((answer, answerIndex) => (
                                        <div key={answer.questionId} className="text-sm bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">Q{answerIndex + 1}</span>
                                            <div className="flex items-center gap-2">
                                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                answer.isCorrect 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                              </span>
                                              <span className="text-gray-600">+{answer.points} pts</span>
                                              <span className="text-gray-600">{Math.floor(answer.timeSpent / 60)}:{(answer.timeSpent % 60).toString().padStart(2, '0')}</span>
                                            </div>
                                          </div>
                                          <p className="text-gray-600 mt-1 truncate">{answer.userAnswer}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              
              {userProgress.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No user data available yet</p>
                  <p className="text-sm">User progress will appear here after assessments are completed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="w-6 h-6 mr-3 text-blue-600" />
              Recent Login Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Login Time</TableHead>
                    <TableHead className="font-bold">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.slice(0, 10).map((login) => (
                    <TableRow key={login.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{login.userName}</TableCell>
                      <TableCell className="text-gray-600">{login.email}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(login.loginTime)}</TableCell>
                      <TableCell className="text-gray-600">{login.ipAddress || 'Unknown'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {loginHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No login activity yet</p>
                  <p className="text-sm">Login history will appear here when users log in</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
