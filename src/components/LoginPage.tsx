
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { loginService } from '../services/loginService';
import { Mail, Lock, User, Shield, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

const LoginPage = ({ onLoginSuccess, onSwitchToRegister }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login for:', email);
      
      const result = await loginService.login({ email, password });
      
      if (result.success) {
        toast({
          title: "Login Successful!",
          description: "Welcome back! Email notification sent.",
        });
        
        console.log('✅ Login successful for:', email);
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        console.log('❌ Login failed:', result.message);
        setError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
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
        
        <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-200"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-1200"></div>
      </div>

      <div className="max-w-sm w-full space-y-6 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-600 to-blue-600 backdrop-blur-sm rounded-full flex items-center justify-center mb-5 border-2 border-purple-400/50 shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h2>
          <p className="text-xl text-purple-200 mb-3 font-semibold">
            Sign in to your account
          </p>
          <p className="text-purple-300 flex items-center justify-center gap-2 text-base">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Access your AI assessment dashboard
            <Sparkles className="h-4 w-4 animate-pulse" />
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-purple-500/30 p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-11 h-12 bg-gray-800/50 border-2 border-purple-500/30 text-white placeholder-purple-300/70 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-base font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-11 pr-11 h-12 bg-gray-800/50 border-2 border-purple-500/30 text-white placeholder-purple-300/70 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-base font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-purple-400 hover:text-purple-300 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-purple-400 hover:text-purple-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-900/50 border-2 border-red-500/50 text-white rounded-lg">
                <AlertDescription className="text-red-200 font-medium text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-base rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-purple-400/50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Sign In to Dashboard</span>
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-purple-300 hover:text-purple-200 text-sm font-bold transition-colors duration-200 flex items-center gap-2 mx-auto group"
                >
                  <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Don't have an account? Register here</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
