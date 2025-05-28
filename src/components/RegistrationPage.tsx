
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '../services/emailService';

interface RegistrationPageProps {
  onRegistrationSuccess: () => void;
}

const RegistrationPage = ({ onRegistrationSuccess }: RegistrationPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    // Standard email validation - allows capitals, numbers, and common formats
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check for common email domains
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const validDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
      'live.com', 'icloud.com', 'protonmail.com', 'aol.com',
      'msn.com', 'ymail.com', 'zoho.com'
    ];
    
    return validDomains.includes(emailDomain);
  };

  const validatePassword = (password: string) => {
    // Password must be at least 8 characters
    if (password.length < 8) return false;
    
    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasLetter && hasNumber;
  };

  const validateFullName = (name: string) => {
    // Allow normal names with letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation with specific error messages
    if (!fullName.trim()) {
      setError('Please enter your full name');
      setIsLoading(false);
      return;
    }

    if (!validateFullName(fullName)) {
      setError('Please enter a valid full name (2-50 characters, letters only)');
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address from Gmail, Yahoo, Outlook, or other major providers');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter a password');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with letters and numbers');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Get user's IP address for logging
      let ipAddress = 'Unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipError) {
        console.log('Could not fetch IP address:', ipError);
      }

      // Send registration details to admin
      const emailSent = await emailService.sendRegistrationNotification({
        fullName,
        email,
        registrationDate: new Date().toISOString(),
        ipAddress
      });

      if (emailSent) {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Please login with your credentials.",
        });
        
        // Store user data locally WITH PASSWORD for login verification
        localStorage.setItem('registeredUser', JSON.stringify({
          fullName,
          email,
          password, // Store password for login verification
          registrationDate: new Date().toISOString(),
          approved: true,
          ipAddress
        }));

        // Small delay to show success message, then switch to login
        setTimeout(() => {
          onRegistrationSuccess();
        }, 2000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill in your details to register
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use Gmail, Yahoo, Outlook, or other major email providers
              </p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters with letters and numbers"
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              * All fields are required
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
