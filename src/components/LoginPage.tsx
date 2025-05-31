
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { loginService } from '../services/loginService';
import { Mail, Lock, User, Shield, Sparkles, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

const LoginPage = ({ onLoginSuccess, onSwitchToRegister }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/30">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-xl text-purple-100 mb-2">
            Sign in to your account
          </p>
          <p className="text-purple-200 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Access your AI assessment dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-purple-300" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-12 h-12 bg-white/10 border-white/30 text-white placeholder-purple-200 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-300" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 h-12 bg-white/10 border-white/30 text-white placeholder-purple-200 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50"
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-500/20 border-red-400/50 text-white">
                <AlertDescription className="text-red-100">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Sign In to Dashboard
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-white hover:text-purple-200 text-sm font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto group"
                >
                  <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Don't have an account? Register here
                </button>
              </div>
            </div>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-purple-100 text-xs text-center mb-4 font-medium">
              What you'll get access to:
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                AI-powered interview assessments
              </div>
              <div className="flex items-center gap-2 text-purple-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Multiple domains & difficulty levels
              </div>
              <div className="flex items-center gap-2 text-purple-200">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                Detailed performance analytics
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
