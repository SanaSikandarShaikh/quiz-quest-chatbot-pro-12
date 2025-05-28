
import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import RegistrationPage from '../components/RegistrationPage';

const Index = () => {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check if user is already registered
    const registeredUser = localStorage.getItem('registeredUser');
    if (registeredUser) {
      setIsRegistered(true);
    }
  }, []);

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('registeredUser');
    setIsRegistered(false);
  };

  if (!isRegistered) {
    return <RegistrationPage onRegistrationSuccess={handleRegistrationSuccess} />;
  }

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
