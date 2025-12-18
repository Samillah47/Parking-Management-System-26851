import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { ParkingSquare, Mail, RefreshCw } from 'lucide-react';

// Define User type to match what your AuthContext expects
type UserRole = 'ADMIN' | 'STAFF' | 'USER';

interface User {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

interface LocationState {
  userId?: number;
  message?: string;
}

interface VerifyResponse {
  token: string;
  user: User;
  error?: string;
}

interface ResendResponse {
  message?: string;
  error?: string;
}

export function Verify2FA() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const state = location.state as LocationState;
  const userId = state?.userId;
  const message = state?.message;

  // Redirect to login if no userId
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!userId) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Verification code expired. Please login again.');
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, navigate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });

      const data: VerifyResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Cast the user to ensure type compatibility
      const user: User = data.user as User;

      // Login successful - save token and user to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Call login function
      login(data.token, user);
      
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Verification failed. Please try again.');
      }
      setCode(''); // Clear the code input
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const response = await fetch(
        `http://localhost:8080/auth/resend-2fa?userId=${userId}`,
        { method: 'POST' }
      );

      const data: ResendResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      alert('Verification code has been resent to your email!');
      setCountdown(300); // Reset timer to 5 minutes
      setCode(''); // Clear the code input
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to resend code. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <ParkingSquare size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600 mt-2">Enter the verification code</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Email Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Mail className="text-indigo-600" size={32} />
            </div>
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={6}
                required
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Code expires in:{' '}
                <span className="font-semibold text-indigo-600">
                  {formatTime(countdown)}
                </span>
              </p>
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center space-x-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
              <span>
                {resending ? 'Sending...' : "Didn't receive a code? Resend"}
              </span>
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Back to login
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div>
              <p className="text-xs text-blue-700 font-medium">
                Security Notice
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Never share your verification code with anyone. ParkSphere staff
                will never ask for this code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}