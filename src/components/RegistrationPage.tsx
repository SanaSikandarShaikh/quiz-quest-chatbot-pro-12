
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '../services/emailService';
import { Mail, Lock, User, Shield, Sparkles, CheckCircle, Eye, EyeOff, UserPlus } from 'lucide-react';

interface RegistrationPageProps {
  onRegistrationSuccess: () => void;
}

const RegistrationPage = ({ onRegistrationSuccess }: RegistrationPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

      // Send registration details to admin at mysteriousmee47@gmail.com
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-200"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-1200"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-purple-600 to-blue-600 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border-2 border-purple-400/50 shadow-2xl">
            <UserPlus className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Join Us Today
          </h2>
          <p className="text-2xl text-purple-200 mb-4 font-semibold">
            Create your account
          </p>
          <p className="text-purple-300 flex items-center justify-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 animate-pulse" />
            Start your AI assessment journey
            <Sparkles className="h-5 w-5 animate-pulse" />
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-black/40 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-500/30 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-6 w-6 text-purple-400" />
                  </div>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-14 h-14 bg-gray-800/50 border-2 border-purple-500/30 text-white placeholder-purple-300/70 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-6 w-6 text-purple-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-14 h-14 bg-gray-800/50 border-2 border-purple-500/30 text-white placeholder-purple-300/70 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg font-medium"
                  />
                </div>
                <p className="mt-2 text-xs text-purple-300/70">
                  Use Gmail, Yahoo, Outlook, or other major email providers
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-6 w-6 text-purple-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters with letters and numbers"
                    className="pl-14 pr-14 h-14 bg-gray-800/50 border-2 border-purple-500/30 text-white placeholder-purple-300/70 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6 text-purple-400 hover:text-purple-300 transition-colors" />
                    ) : (
                      <Eye className="h-6 w-6 text-purple-400 hover:text-purple-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-6 w-6 text-purple-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-14 pr-14 h-14 bg-gray-800/50 border-2 border-purple-500/30 text-white placeholder-purple-300/70 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-6 w-6 text-purple-400 hover:text-purple-300 transition-colors" />
                    ) : (
                      <Eye className="h-6 w-6 text-purple-400 hover:text-purple-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-900/50 border-2 border-red-500/50 text-white rounded-xl">
                <AlertDescription className="text-red-200 font-medium text-base">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-5">
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-purple-400/50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-lg">Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-lg">Create Account</span>
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-purple-300 text-base font-bold flex items-center justify-center gap-2">
                  <span>All fields are required</span>
                  <Sparkles className="h-4 w-4" />
                </p>
              </div>
            </div>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t-2 border-purple-500/30">
            <p className="text-purple-200 text-sm text-center mb-6 font-bold uppercase tracking-wider">
              What you'll get access to:
            </p>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center gap-3 text-purple-200 bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">AI-powered interview assessments</span>
              </div>
              <div className="flex items-center gap-3 text-purple-200 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Multiple domains & difficulty levels</span>
              </div>
              <div className="flex items-center gap-3 text-purple-200 bg-pink-900/20 p-3 rounded-lg border border-pink-500/30">
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Detailed performance analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
