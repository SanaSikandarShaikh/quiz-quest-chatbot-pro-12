
import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import RegistrationPage from '../components/RegistrationPage';
import LoginPage from '../components/LoginPage';

const Index = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

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
  }, []);

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
    setShowLogin(true); // Show login after registration
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Store login session
    sessionStorage.setItem('loginSession', JSON.stringify({
      timestamp: new Date().toISOString(),
      email: JSON.parse(localStorage.getItem('registeredUser') || '{}').email
    }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loginSession');
    setIsLoggedIn(false);
    setShowLogin(true);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
  };

  const handleSwitchToLogin = () => {
    setShowLogin(true);
  };

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

  // If both registered and logged in, show chat interface
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <ChatInterface />
    </div>
  );
};

export default Index;
