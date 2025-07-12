'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Current timestamp and user for debug info
  const currentTime = "2025-07-12 10:54:04";
  const currentUser = "devang-vala";

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear that field's error on change
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError('');
    setFieldErrors({ email: '', password: '' });

    const { email, password } = formData;
    let hasError = false;

    // 1) Client‑side validation
    if (!email.trim()) {
      setFieldErrors(fe => ({ ...fe, email: 'Email is required' }));
      hasError = true;
    }
    if (!password) {
      setFieldErrors(fe => ({ ...fe, password: 'Password is required' }));
      hasError = true;
    }
    if (hasError) {
      setLoading(false);
      return;
    }

    // 2) Call NextAuth
    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        // Could parse res.error for specific messages
        setGlobalError('Invalid email or password');
      } else {
        // On success, get session and redirect by role
        const session = await getSession();
        const dest = session?.user?.role === 'admin'
          ? '/admin'
          : '/dashboard';
        router.push(dest);
      }
    } catch (err) {
      setGlobalError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-10">
      {/* Logo and Header */}
      <div className="mb-10 w-full max-w-md text-center">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sign In
        </h1>
        <p className="text-gray-600">
          Welcome back! Sign in to your account
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {globalError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 text-sm">
                {globalError}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`pl-10 w-full px-4 py-3 border-2 focus:outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#00d447]'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 w-full px-4 py-3 border-2 focus:outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#00d447]'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mx-auto"></div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-medium text-[#00d447] hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Background Grid Pattern */}
      <div className="bg-grid-pattern fixed inset-0 z-[-1] opacity-[0.02]"></div>
    </div>
  );
}