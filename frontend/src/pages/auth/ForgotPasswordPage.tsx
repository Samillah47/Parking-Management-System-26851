import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ParkingSquare, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
type FormState = 'input' | 'loading' | 'success';
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('input');
  const [error, setError] = useState('');
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setFormState('loading');
    
    try {
      const response = await fetch(`http://localhost:8080/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setFormState('success');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send reset email');
        setFormState('input');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setFormState('input');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <ParkingSquare size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            {formState === 'success' ? 'Check your email for instructions' : "We'll send you a link to reset your password"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {formState === 'success' ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email Sent!
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to{' '}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button onClick={() => setFormState('input')} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  try again
                </button>
              </p>
              <Link to="/reset-password">
                <Button className="w-full mb-4">Enter OTP and Reset Password</Button>
              </Link>
              <Link to="/login">
                <Button className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>}

              <div className="relative">
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                <Mail size={18} className="absolute right-3 top-9 text-gray-400 pointer-events-none" />
              </div>

              <Button type="submit" className="w-full" disabled={formState === 'loading'}>
                {formState === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              <ArrowLeft size={16} className="mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}