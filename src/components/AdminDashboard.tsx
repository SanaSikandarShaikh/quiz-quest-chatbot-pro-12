
import React, { useState, useEffect } from 'react';
import { persistenceService, UserData, LoginAttempt } from '../services/persistenceService';
import { Users, TrendingUp, Clock, Award, Calendar, Eye, EyeOff, Mail, Target, Timer } from 'lucide-react';
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
    if (accuracy >= 80) return { text: 'Highly Eligible', color: 'text-green-600 bg-green-100' };
    if (accuracy >= 60) return { text: 'Eligible', color: 'text-blue-600 bg-blue-100' };
    if (accuracy >= 40) return { text: 'Partially Eligible', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Not Eligible', color: 'text-red-600 bg-red-100' };
  };

  const totalUsers = users.length;
  const totalAssessments = users.reduce((sum, user) => sum + user.totalAssessments, 0);
  const averageAccuracy = users.length > 0 
    ? Math.round(users.reduce((sum, user) => sum + user.accuracy, 0) / users.length)
    : 0;
  const recentLogins = loginHistory.filter(login => login.success).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            👨‍💼 Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Complete user management and assessment analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-600 text-base">
                <Users className="w-5 h-5 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{totalUsers}</div>
              <p className="text-sm text-gray-600 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-600 text-base">
                <TrendingUp className="w-5 h-5 mr-2" />
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{totalAssessments}</div>
              <p className="text-sm text-gray-600 mt-1">Completed assessments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-purple-600 text-base">
                <Award className="w-5 h-5 mr-2" />
                Avg. Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{averageAccuracy}%</div>
              <p className="text-sm text-gray-600 mt-1">Platform average</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-orange-600 text-base">
                <Clock className="w-5 h-5 mr-2" />
                Successful Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700">{recentLogins}</div>
              <p className="text-sm text-gray-600 mt-1">Login attempts</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="w-6 h-6 mr-3 text-blue-600" />
              User Assessment Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Tests</TableHead>
                    <TableHead className="font-bold">Best Score</TableHead>
                    <TableHead className="font-bold">Avg Score</TableHead>
                    <TableHead className="font-bold">Accuracy</TableHead>
                    <TableHead className="font-bold">Eligibility</TableHead>
                    <TableHead className="font-bold">Last Login</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const eligibility = getEligibilityStatus(user.accuracy);
                    return (
                      <React.Fragment key={user.id}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell className="text-gray-600 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {user.totalAssessments}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {user.bestScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                              {user.averageScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {user.accuracy}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${eligibility.color}`}>
                              {eligibility.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowUserDetails(showUserDetails === user.id ? null : user.id)}
                              className="flex items-center gap-1"
                            >
                              {showUserDetails === user.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {showUserDetails === user.id ? 'Hide' : 'Details'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Detailed user information */}
                        {showUserDetails === user.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-gray-50 p-6">
                              <div className="space-y-4">
                                <h4 className="font-bold text-lg mb-4 flex items-center">
                                  <Users className="w-5 h-5 mr-2" />
                                  Detailed Profile: {user.fullName}
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                  <div className="bg-white p-4 rounded-lg border">
                                    <h5 className="font-semibold text-gray-700 mb-2">Account Info</h5>
                                    <p className="text-sm text-gray-600">Email: {user.email}</p>
                                    <p className="text-sm text-gray-600">Registered: {formatDate(user.registrationDate)}</p>
                                    <p className="text-sm text-gray-600">User ID: {user.id}</p>
                                  </div>
                                  
                                  <div className="bg-white p-4 rounded-lg border">
                                    <h5 className="font-semibold text-gray-700 mb-2">Performance Stats</h5>
                                    <p className="text-sm text-gray-600">Total Questions: {user.totalQuestions}</p>
                                    <p className="text-sm text-gray-600">Correct Answers: {user.correctAnswers}</p>
                                    <p className="text-sm text-gray-600">Success Rate: {user.accuracy}%</p>
                                  </div>
                                  
                                  <div className="bg-white p-4 rounded-lg border">
                                    <h5 className="font-semibold text-gray-700 mb-2">Assessment Summary</h5>
                                    <p className="text-sm text-gray-600">Total Tests: {user.totalAssessments}</p>
                                    <p className="text-sm text-gray-600">Best Score: {user.bestScore}</p>
                                    <p className="text-sm text-gray-600">Average Score: {user.averageScore}</p>
                                  </div>
                                </div>

                                {user.sessions && user.sessions.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-gray-700 mb-3">Recent Assessment History</h5>
                                    <div className="grid gap-3">
                                      {user.sessions.slice(-5).map((session: any, index: number) => (
                                        <div key={session.id} className="bg-white p-4 rounded-lg border">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <h6 className="font-medium">Assessment {index + 1}</h6>
                                              <p className="text-sm text-gray-600 flex items-center">
                                                <Timer className="w-3 h-3 mr-1" />
                                                {session.domain} • {session.level} • {formatDate(session.startTime)}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-lg font-bold text-blue-600">{session.totalScore} pts</div>
                                              <div className="text-sm text-gray-600">
                                                {session.answers?.filter((a: any) => a.isCorrect).length || 0}/{session.answers?.length || 0} correct
                                              </div>
                                            </div>
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
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No users registered yet</p>
                  <p className="text-sm">User data will appear here after registration and assessments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="w-6 h-6 mr-3 text-green-600" />
              Login Activity History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">User Name</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Login Time</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.slice(0, 20).map((login) => (
                    <TableRow key={login.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{login.userName || 'Unknown'}</TableCell>
                      <TableCell className="text-gray-600">{login.email}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(login.loginTime)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          login.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {login.success ? '✅ Success' : '❌ Failed'}
                        </span>
                      </TableCell>
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

export default AdminDashboard;
