
import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import RegistrationPage from '../components/RegistrationPage';
import LoginPage from '../components/LoginPage';
import AdminDashboard from '../components/AdminDashboard';
import { persistenceService } from '../services/persistenceService';

const Index = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    // Check if user is already registered and logged in
    const registeredUser = localStorage.getItem('registeredUser');
    const loginSession = sessionStorage.getItem('loginSession');
    
    if (registeredUser) {
      setIsRegistered(true);
      if (loginSession) {
        setIsLoggedIn(true);
      }
    }

    // Ensure persistent data is maintained across sessions
    const userData = persistenceService.getAllUsers();
    const loginHistory = persistenceService.getLoginHistory();
    const sessions = persistenceService.getSessions();
    
    // Log data availability for debugging
    console.log('📊 Persistent data loaded:', {
      users: userData.length,
      loginHistory: loginHistory.length,
      sessions: sessions.length
    });
  }, []);

  const handleRegistrationSuccess = () => {
    const registeredUser = localStorage.getItem('registeredUser');
    if (registeredUser) {
      const userData = JSON.parse(registeredUser);
      
      const userRecord = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        registrationDate: userData.registrationDate,
        sessions: [],
        totalAssessments: 0,
        bestScore: 0,
        averageScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        lastLoginDate: ''
      };
      
      persistenceService.saveUser(userRecord);
      console.log('✅ User data saved to persistent storage');
    }
    
    setIsRegistered(true);
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const loginData = {
      timestamp: new Date().toISOString(),
      email: JSON.parse(localStorage.getItem('registeredUser') || '{}').email
    };
    
    sessionStorage.setItem('loginSession', JSON.stringify(loginData));
    
    // Update last login date in persistent storage
    const user = persistenceService.getUserByEmail(loginData.email);
    if (user) {
      user.lastLoginDate = loginData.timestamp;
      persistenceService.saveUser(user);
      console.log('✅ Login timestamp updated in persistent storage');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loginSession');
    setIsLoggedIn(false);
    setShowLogin(true);
    setShowAdminDashboard(false);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
  };

  const handleSwitchToLogin = () => {
    setShowLogin(true);
  };

  const toggleAdminDashboard = () => {
    setShowAdminDashboard(!showAdminDashboard);
  };

  // Admin Dashboard View
  if (showAdminDashboard) {
    return (
      <div className="min-h-screen">
        <div className="absolute top-4 left-4 z-10 flex gap-3">
          <button
            onClick={toggleAdminDashboard}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-lg"
          >
            ← Back to Assessment
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-lg"
          >
            Logout
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // If not registered, show registration
  if (!isRegistered) {
    return <RegistrationPage onRegistrationSuccess={handleRegistrationSuccess} />;
  }

  // If registered but not logged in, show login or registration
  if (!isLoggedIn) {
    if (showLogin) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={handleSwitchToRegister} />;
    } else {
      return <RegistrationPage onRegistrationSuccess={handleRegistrationSuccess} />;
    }
  }

  // If both registered and logged in, show main interface
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex gap-3">
        <button
          onClick={toggleAdminDashboard}
          className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 font-medium"
        >
          Admin Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg font-medium"
        >
          Logout
        </button>
      </div>
      <ChatInterface />
    </div>
  );
};

export default Index;
