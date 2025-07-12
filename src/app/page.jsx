'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import { Search, TrendingUp, Users, MessageSquare, Award } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();

  // Sample questions data
  const questions = [
    {
      id: 1,
      title: "How to join 2 columns in a data set to make a separate column in SQL",
      description: "I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name and column 2 consists of last name I want a column to combine...",
      tags: ["SQL", "Database"],
      user: "John Developer",
      answers: 5,
      votes: 12,
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Best practices for React state management in large applications",
      description: "I'm working on a large React application and struggling with state management. What are the best practices and patterns for managing state effectively?",
      tags: ["React", "JavaScript", "State Management"],
      user: "Sarah Chen",
      answers: 3,
      votes: 8,
      time: "4 hours ago"
    },
    {
      id: 3,
      title: "How to implement authentication with NextJS and MongoDB",
      description: "I need to implement a secure authentication system using NextJS and MongoDB. What's the recommended approach?",
      tags: ["NextJS", "MongoDB", "Authentication"],
      user: "Mike Johnson",
      answers: 2,
      votes: 15,
      time: "6 hours ago"
    }
  ];

  const filters = ["Newest", "Unanswered", "Popular", "Hot"];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero and Stats Section */}
        {!session && (
          <div>
            <div className="text-center py-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to StackIt
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
                A minimal Q&A forum platform for collaborative learning and structured knowledge sharing
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/signin"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">3.5k+</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">8.2k+</div>
                <div className="text-sm text-gray-600">Answers</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">1.2k+</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Solved</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Questions List */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filter === 'Newest'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-purple-600 cursor-pointer">
                      {question.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 ml-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{question.answers} ans</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {question.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{question.votes} votes</span>
                      <span>by {question.user}</span>
                      <span>{question.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-lg border transition-colors ${
                      page === 1
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions today</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Answers today</span>
                  <span className="font-semibold">67</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New users</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'NextJS', 'CSS', 'Node.js', 'MongoDB', 'Python', 'SQL'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}