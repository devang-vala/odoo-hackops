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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Join StackIt Community
          </h2>
          <p className="mt-2 text-purple-100">
            Create your account to start asking and answering questions
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {globalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${
                    fieldErrors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-500'
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
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${
                    fieldErrors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-500'
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
                <p className="mt-2 text-sm text-purple-600 font-medium">
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
                  className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${
                    fieldErrors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-500'
                  }`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(prev => !prev)}
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
                  className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${
                    fieldErrors.confirmPassword
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-purple-500'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.confirmPassword[0]}</p>
              )}
            </div>

            {/* Info */}
            <div className="text-sm text-gray-600">
              <p>💡 Admin access: Use email ending with <code className="bg-gray-100 px-1 rounded">.admin@gmail.com</code></p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
