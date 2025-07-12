'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { UserInputSchema } from '@/lib/validation/userValidation'; // point this to your Zod file

export default function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGlobalError('');

    // 1) Run Zod validation on the subset schema (omit confirmPassword)
    const { name, email, password, confirmPassword } = formData;
    const toValidate = { name, email, password, role: 'user' }; 
    // role is required by schema but we're defaulting to 'user' here

    const result = UserInputSchema.safeParse(toValidate);
    if (!result.success) {
      const errs = result.error.flatten().fieldErrors;
      setFieldErrors(errs);
      setLoading(false);
      return;
    }

    // 2) Confirm‑password check
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ['Passwords do not match'] });
      setLoading(false);
      return;
    }

    // 3) Submit to your API
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // if you returned field errors in 400, show them
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setGlobalError(data.error || 'Something went wrong');
        }
      } else {
        router.push('/auth/signin?message=Account created successfully');
      }
    } catch (err) {
      setGlobalError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isAdminEmail = formData.email.endsWith('.admin@gmail.com');

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-6 pb-10">
      {/* Logo and Header */}
      <div className="mb-8 w-full max-w-md text-center">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-gray-600">
          Join our community to share knowledge
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {globalError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 text-sm">
                {globalError}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`pl-10 w-full px-4 py-3 border-2 focus:outline-none transition-all ${
                    fieldErrors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#00d447]'
                  }`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Email */}
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
                    fieldErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#00d447]'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.email[0]}</p>
              )}
              {isAdminEmail && (
                <p className="mt-2 text-sm text-[#00d447] font-medium">
                  🔧 Admin account detected
                </p>
              )}
            </div>

            {/* Password */}
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
                    fieldErrors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#00d447]'
                  }`}
                  placeholder="Create a password"
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
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`pl-10 pr-10 w-full px-4 py-3 border-2 focus:outline-none transition-all ${
                    fieldErrors.confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#00d447]'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.confirmPassword[0]}</p>
              )}
            </div>

            {/* Admin Email Info */}
            <div className="border-2 border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              <p>💡 Admin access: Use email ending with <code className="bg-white px-1 py-0.5 border border-gray-200">.admin@gmail.com</code></p>
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
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              )}
            </button>

            {/* Sign In Link */}
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-[#00d447] hover:underline transition-colors"
                >
                  Sign in here
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