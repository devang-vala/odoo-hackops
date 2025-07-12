'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Award, MessageSquare, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-4 border-[#00d447] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {session.user.name}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to share knowledge and help the community?
              </p>
              {session.user.role === 'admin' && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 border border-gray-200">
                    🔧 Admin Access
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ask-question">
                <button className="px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                  Ask Question
                </button>
              </Link>
              <div className="w-16 h-16 border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-800">
                <span className="text-2xl font-bold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
            <div className="flex items-center">
              <div className="p-2 border-2 border-blue-200 bg-blue-100">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions Asked</p>
                <p className="text-2xl font-bold text-gray-900">{session.user.questionsAsked || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
            <div className="flex items-center">
              <div className="p-2 border-2 border-[#00d447] bg-green-100">
                <Award className="w-6 h-6 text-[#00d447]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Answers Given</p>
                <p className="text-2xl font-bold text-gray-900">{session.user.answersGiven || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
            <div className="flex items-center">
              <div className="p-2 border-2 border-gray-200 bg-gray-100">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reputation</p>
                <p className="text-2xl font-bold text-gray-900">{session.user.reputation || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
            <div className="flex items-center">
              <div className="p-2 border-2 border-orange-200 bg-orange-100">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">People Reached</p>
                <p className="text-2xl font-bold text-gray-900">5.2k</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Questions */}
          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recent Questions</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-4 border-gray-300 pl-4 py-2 hover:border-[#00d447] transition-colors">
                  <h3 className="font-medium text-gray-900">
                    How to implement authentication in Next.js?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    5 answers • 12 votes • 2 days ago
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Answers */}
          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recent Answers</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-4 border-gray-300 pl-4 py-2 hover:border-[#00d447] transition-colors">
                  <h3 className="font-medium text-gray-900">
                    Best practices for React state management
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    8 votes • Accepted • 1 day ago
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}