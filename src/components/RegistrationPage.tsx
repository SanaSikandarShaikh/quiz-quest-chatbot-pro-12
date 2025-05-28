
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

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
    // More strict email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check for fake email patterns
    const fakeEmailPatterns = [
      /test@test\.com/i,
      /fake@fake\.com/i,
      /dummy@dummy\.com/i,
      /sample@sample\.com/i,
      /example@example\.com/i,
      /admin@admin\.com/i,
      /user@user\.com/i,
      /temp@temp\.com/i,
      /123@123\.com/i,
      /abc@abc\.com/i,
      /xyz@xyz\.com/i,
      /qwerty@qwerty\.com/i,
      /@gmail\.co$/i, // Missing 'm' at end
      /@yahoo\.co$/i, // Missing 'm' at end
      /\d{10,}@/i, // Too many consecutive numbers
      /(.)\1{4,}@/i, // Repeated characters
    ];

    return !fakeEmailPatterns.some(pattern => pattern.test(email));
  };

  const validatePassword = (password: string) => {
    // Stronger password validation
    if (password.length < 8) return false;
    
    // Check for at least one uppercase, one lowercase, one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber;
  };

  const validateFullName = (name: string) => {
    // Check for realistic name patterns
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    if (!nameRegex.test(name.trim())) return false;
    
    // Check for fake names
    const fakeNamePatterns = [
      /test/i,
      /fake/i,
      /dummy/i,
      /sample/i,
      /admin/i,
      /user/i,
      /temp/i,
      /123/,
      /abc/i,
      /xyz/i,
      /qwerty/i,
      /asdf/i,
      /(.)\1{3,}/i, // Repeated characters like "aaaa"
    ];

    return !fakeNamePatterns.some(pattern => pattern.test(name));
  };

  const sendRegistrationEmail = async (userDetails: any) => {
    try {
      const emailData = {
        to_email: 'sshaikh41790@gmail.com',
        from_name: userDetails.fullName,
        from_email: userDetails.email,
        message: `New user registration:
        
Name: ${userDetails.fullName}
Email: ${userDetails.email}
Registration Date: ${new Date().toLocaleString()}
IP Address: ${userDetails.ipAddress || 'Unknown'}`,
        subject: 'New User Registration - Verification Required'
      };

      console.log('Sending registration email to admin:', emailData);
      
      // In a real implementation, you would use a service like EmailJS or your backend
      // await emailjs.send('service_id', 'template_id', emailData, 'public_key');
      
      return true;
    } catch (error) {
      console.error('Failed to send registration email:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation with specific error messages
    if (!fullName.trim()) {
      setError('Wrong email id or password');
      setIsLoading(false);
      return;
    }

    if (!validateFullName(fullName)) {
      setError('Wrong email id or password');
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Wrong email id or password');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Wrong email id or password');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Wrong email id or password');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Wrong email id or password');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Wrong email id or password');
      setIsLoading(false);
      return;
    }

    // Additional check: Ensure email domain is valid
    const emailDomain = email.split('@')[1];
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'protonmail.com'];
    
    if (!validDomains.includes(emailDomain.toLowerCase())) {
      setError('Wrong email id or password');
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
      const emailSent = await sendRegistrationEmail({
        fullName,
        email,
        registrationDate: new Date().toISOString(),
        ipAddress
      });

      if (emailSent) {
        toast({
          title: "Registration Successful!",
          description: "Your registration has been submitted for admin approval.",
        });
        
        // Store user data locally with approval status
        localStorage.setItem('registeredUser', JSON.stringify({
          fullName,
          email,
          registrationDate: new Date().toISOString(),
          approved: true, // For demo purposes, auto-approve
          ipAddress
        }));

        // Small delay to show success message
        setTimeout(() => {
          onRegistrationSuccess();
        }, 1500);
      } else {
        setError('Registration failed. Please try again with valid details.');
      }
    } catch (error) {
      setError('Wrong email id or password');
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
            Please provide valid details for registration
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
                placeholder="Enter your real full name"
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
                placeholder="Enter your valid email address"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only Gmail, Yahoo, Outlook, and other major email providers accepted
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
                placeholder="At least 8 chars with uppercase, lowercase & number"
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
              {isLoading ? 'Validating & Registering...' : 'Register'}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              * All fields are required. Fake or invalid details will be rejected.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
