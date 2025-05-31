
import React, { useState, useEffect } from 'react';
import { persistenceService, UserData, LoginAttempt } from '../services/persistenceService';
import { Users, TrendingUp, Clock, Award, Calendar, Eye, EyeOff, Mail, Target, Timer, User, Trophy, BookOpen, Activity, CheckCircle, XCircle, Hash, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setUsers(persistenceService.getAllUsers());
    setLoginHistory(persistenceService.getLoginHistory());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getEligibilityStatus = (accuracy: number) => {
    if (accuracy >= 80) return { text: 'Highly Eligible', color: 'text-green-400 bg-green-900/30 border-green-500/50' };
    if (accuracy >= 60) return { text: 'Eligible', color: 'text-blue-400 bg-blue-900/30 border-blue-500/50' };
    if (accuracy >= 40) return { text: 'Partially Eligible', color: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50' };
    return { text: 'Not Eligible', color: 'text-red-400 bg-red-900/30 border-red-500/50' };
  };

  const totalUsers = users.length;
  const totalAssessments = users.reduce((sum, user) => sum + user.totalAssessments, 0);
  const averageAccuracy = users.length > 0 
    ? Math.round(users.reduce((sum, user) => sum + user.accuracy, 0) / users.length)
    : 0;
  const recentLogins = loginHistory.filter(login => login.success).length;
  const totalQuestions = users.reduce((sum, user) => sum + user.totalQuestions, 0);
  const totalCorrectAnswers = users.reduce((sum, user) => sum + user.correctAnswers, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            👨‍💼 Admin Dashboard
          </h1>
          <p className="text-purple-200 text-xl font-medium">Complete user management and assessment analytics</p>
          <div className="mt-4 flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border-2 border-blue-500/30 hover:border-blue-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-400 text-base">
                <Users className="w-5 h-5 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-300">{totalUsers}</div>
              <p className="text-sm text-gray-400 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-2 border-green-500/30 hover:border-green-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-400 text-base">
                <TrendingUp className="w-5 h-5 mr-2" />
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300">{totalAssessments}</div>
              <p className="text-sm text-gray-400 mt-1">Completed assessments</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 hover:border-purple-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-purple-400 text-base">
                <Award className="w-5 h-5 mr-2" />
                Avg. Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-300">{averageAccuracy}%</div>
              <p className="text-sm text-gray-400 mt-1">Platform average</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-2 border-orange-500/30 hover:border-orange-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-orange-400 text-base">
                <Clock className="w-5 h-5 mr-2" />
                Active Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-300">{recentLogins}</div>
              <p className="text-sm text-gray-400 mt-1">Successful logins</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-2 border-pink-500/30 hover:border-pink-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-pink-400 text-base">
                <BookOpen className="w-5 h-5 mr-2" />
                Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-300">{totalQuestions}</div>
              <p className="text-sm text-gray-400 mt-1">Questions answered</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-cyan-400 text-base">
                <CheckCircle className="w-5 h-5 mr-2" />
                Correct Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-300">{totalCorrectAnswers}</div>
              <p className="text-sm text-gray-400 mt-1">Right answers</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card className="mb-8 bg-black/40 backdrop-blur-sm border-2 border-purple-500/30">
          <CardHeader className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/30">
            <CardTitle className="flex items-center text-2xl text-white">
              <Users className="w-7 h-7 mr-3 text-purple-400" />
              User Assessment Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-purple-500/30 hover:bg-purple-900/20">
                    <TableHead className="font-bold text-purple-300">Name</TableHead>
                    <TableHead className="font-bold text-purple-300">Email</TableHead>
                    <TableHead className="font-bold text-purple-300">Tests</TableHead>
                    <TableHead className="font-bold text-purple-300">Best Score</TableHead>
                    <TableHead className="font-bold text-purple-300">Avg Score</TableHead>
                    <TableHead className="font-bold text-purple-300">Accuracy</TableHead>
                    <TableHead className="font-bold text-purple-300">Eligibility</TableHead>
                    <TableHead className="font-bold text-purple-300">Last Login</TableHead>
                    <TableHead className="font-bold text-purple-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const eligibility = getEligibilityStatus(user.accuracy);
                    return (
                      <React.Fragment key={user.id}>
                        <TableRow className="hover:bg-purple-900/20 border-b border-purple-500/20">
                          <TableCell className="font-medium text-white flex items-center">
                            <User className="w-4 h-4 mr-2 text-purple-400" />
                            {user.fullName}
                          </TableCell>
                          <TableCell className="text-gray-300 flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-blue-400" />
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <span className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                              {user.totalAssessments}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="bg-green-900/40 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                              <Trophy className="w-3 h-3 inline mr-1" />
                              {user.bestScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                              {user.averageScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="bg-indigo-900/40 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium flex items-center border border-indigo-500/30">
                              <Target className="w-3 h-3 mr-1" />
                              {user.accuracy}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${eligibility.color}`}>
                              {eligibility.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            <div className="flex items-center">
                              <CalendarIcon className="w-3 h-3 mr-1 text-orange-400" />
                              {user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowUserDetails(showUserDetails === user.id ? null : user.id)}
                              className="flex items-center gap-1 bg-black/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/40"
                            >
                              {showUserDetails === user.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {showUserDetails === user.id ? 'Hide' : 'Details'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Detailed user information */}
                        {showUserDetails === user.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-purple-900/20 p-6 border-b border-purple-500/30">
                              <div className="space-y-6">
                                <h4 className="font-bold text-2xl mb-4 flex items-center text-white">
                                  <Users className="w-6 h-6 mr-3 text-purple-400" />
                                  Detailed Profile: {user.fullName}
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                  <div className="bg-black/40 p-5 rounded-xl border-2 border-blue-500/30">
                                    <h5 className="font-bold text-blue-400 mb-3 flex items-center">
                                      <User className="w-5 h-5 mr-2" />
                                      Account Info
                                    </h5>
                                    <p className="text-sm text-gray-300 mb-2">📧 Email: {user.email}</p>
                                    <p className="text-sm text-gray-300 mb-2">📅 Registered: {formatDate(user.registrationDate)}</p>
                                    <p className="text-sm text-gray-300">🆔 User ID: {user.id}</p>
                                  </div>
                                  
                                  <div className="bg-black/40 p-5 rounded-xl border-2 border-green-500/30">
                                    <h5 className="font-bold text-green-400 mb-3 flex items-center">
                                      <Activity className="w-5 h-5 mr-2" />
                                      Performance Stats
                                    </h5>
                                    <p className="text-sm text-gray-300 mb-2">❓ Total Questions: {user.totalQuestions}</p>
                                    <p className="text-sm text-gray-300 mb-2">✅ Correct Answers: {user.correctAnswers}</p>
                                    <p className="text-sm text-gray-300">🎯 Success Rate: {user.accuracy}%</p>
                                  </div>
                                  
                                  <div className="bg-black/40 p-5 rounded-xl border-2 border-purple-500/30">
                                    <h5 className="font-bold text-purple-400 mb-3 flex items-center">
                                      <Trophy className="w-5 h-5 mr-2" />
                                      Assessment Summary
                                    </h5>
                                    <p className="text-sm text-gray-300 mb-2">📊 Total Tests: {user.totalAssessments}</p>
                                    <p className="text-sm text-gray-300 mb-2">🏆 Best Score: {user.bestScore}</p>
                                    <p className="text-sm text-gray-300">📈 Average Score: {user.averageScore}</p>
                                  </div>

                                  <div className="bg-black/40 p-5 rounded-xl border-2 border-orange-500/30">
                                    <h5 className="font-bold text-orange-400 mb-3 flex items-center">
                                      <Hash className="w-5 h-5 mr-2" />
                                      Additional Metrics
                                    </h5>
                                    <p className="text-sm text-gray-300 mb-2">🕒 Last Login: {user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never'}</p>
                                    <p className="text-sm text-gray-300 mb-2">📍 Status: {user.accuracy >= 60 ? '🟢 Active' : '🟡 Needs Improvement'}</p>
                                    <p className="text-sm text-gray-300">⭐ Rating: {user.accuracy >= 80 ? 'Excellent' : user.accuracy >= 60 ? 'Good' : 'Improving'}</p>
                                  </div>
                                </div>

                                {user.sessions && user.sessions.length > 0 && (
                                  <div>
                                    <h5 className="font-bold text-xl text-white mb-4 flex items-center">
                                      <Calendar className="w-6 h-6 mr-3 text-yellow-400" />
                                      Recent Assessment History
                                    </h5>
                                    <div className="grid gap-4">
                                      {user.sessions.slice(-5).map((session: any, index: number) => (
                                        <div key={session.id} className="bg-black/40 p-5 rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all">
                                          <div className="flex justify-between items-start mb-3">
                                            <div>
                                              <h6 className="font-bold text-lg text-white">Assessment {index + 1}</h6>
                                              <p className="text-sm text-purple-300 flex items-center mb-2">
                                                <Timer className="w-4 h-4 mr-2" />
                                                {session.domain} • {session.level} • {formatDate(session.startTime)}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-2xl font-bold text-blue-400">{session.totalScore} pts</div>
                                              <div className="text-sm text-gray-400">
                                                {session.answers?.filter((a: any) => a.isCorrect).length || 0}/{session.answers?.length || 0} correct
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEligibilityStatus((session.answers?.filter((a: any) => a.isCorrect).length || 0) / (session.answers?.length || 1) * 100).color}`}>
                                              {getEligibilityStatus((session.answers?.filter((a: any) => a.isCorrect).length || 0) / (session.answers?.length || 1) * 100).text}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                              Duration: {session.endTime ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60) : 'N/A'} min
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-6 text-gray-600" />
                  <p className="text-2xl font-bold mb-2">No users registered yet</p>
                  <p className="text-lg">User data will appear here after registration and assessments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Login History */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-green-500/30">
          <CardHeader className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-green-500/30">
            <CardTitle className="flex items-center text-2xl text-white">
              <Activity className="w-7 h-7 mr-3 text-green-400" />
              Login Activity History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-green-500/30 hover:bg-green-900/20">
                    <TableHead className="font-bold text-green-300">User Name</TableHead>
                    <TableHead className="font-bold text-green-300">Email</TableHead>
                    <TableHead className="font-bold text-green-300">Login Time</TableHead>
                    <TableHead className="font-bold text-green-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.slice(0, 20).map((login) => (
                    <TableRow key={login.id} className="hover:bg-green-900/20 border-b border-green-500/20">
                      <TableCell className="font-medium text-white flex items-center">
                        <User className="w-4 h-4 mr-2 text-green-400" />
                        {login.userName || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-gray-300">{login.email}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(login.loginTime)}</TableCell>
                      <TableCell>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 w-fit ${
                          login.success 
                            ? 'bg-green-900/40 text-green-300 border-green-500/50' 
                            : 'bg-red-900/40 text-red-300 border-red-500/50'
                        }`}>
                          {login.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {login.success ? 'Success' : 'Failed'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {loginHistory.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="w-16 h-16 mx-auto mb-6 text-gray-600" />
                  <p className="text-2xl font-bold mb-2">No login activity yet</p>
                  <p className="text-lg">Login history will appear here when users log in</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
