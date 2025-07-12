'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Users, MessageSquare, Shield, BarChart3, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allQuestions, setAllQuestions] = useState([]);
  const [allAnswers, setAllAnswers] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [errorQuestions, setErrorQuestions] = useState(null);
  const [errorAnswers, setErrorAnswers] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/');
    } else {
      fetchAllQuestions();
      fetchAllAnswers();
    }
  }, [session, status, router]);

  const fetchAllQuestions = async () => {
    setLoadingQuestions(true);
    setErrorQuestions(null);
    try {
      const res = await fetch('/api/admin/questions');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const filteredData = data.filter(item => item.hasProfanity && !item.isApproved);
      setAllQuestions(filteredData);
      console.log("Fetched profanity flagged questions:", filteredData);
    } catch (error) {
      console.error('Error fetching all questions:', error);
      setErrorQuestions('Failed to load all questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchAllAnswers = async () => {
    setLoadingAnswers(true);
    setErrorAnswers(null);
    try {
      const res = await fetch('/api/admin/answers');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const filteredData = data.filter(item => item.hasProfanity && !item.isApproved);
      setAllAnswers(filteredData);
      console.log("Fetched profanity flagged answers:", filteredData);
    } catch (error) {
      console.error('Error fetching all answers:', error);
      setErrorAnswers('Failed to load all answers.');
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleApproveQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to approve this question?')) {
      try {
        const res = await fetch(`/api/admin/questions/${questionId}/action`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'approve', questionId: questionId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        fetchAllQuestions(); // Refresh the list
      } catch (error) {
        console.error('Error approving question:', error);
        alert('Failed to approve question.');
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/admin/questions/${questionId}/action`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questionId: questionId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        fetchAllQuestions(); // Refresh the list
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question.');
      }
    }
  };

  const handleApproveAnswer = async (answerId) => {
    if (window.confirm('Are you sure you want to approve this answer?')) {
      try {
        const res = await fetch(`/api/admin/answers/${answerId}/action`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'approve', answerId: answerId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        fetchAllAnswers(); // Refresh the list
      } catch (error) {
        console.error('Error approving answer:', error);
        alert('Failed to approve answer.');
      }
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (window.confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/admin/answers/${answerId}/action`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answerId: answerId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        fetchAllAnswers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting answer:', error);
        alert('Failed to delete answer.');
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center">
            <Shield className="w-12 h-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
              <p className="text-red-100 text-lg">
                Manage users, content, and platform settings
              </p>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">1,248</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">3,567</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Active Users</p>
                <p className="text-2xl font-bold text-gray-900">892</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">JD</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-600">john.doe@gmail.com</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200">
                    View
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">SA</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Sarah Admin</p>
                    <p className="text-sm text-gray-600">sarah.admin@gmail.com</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    Admin
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Moderation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Content Moderation</h2>
            <div className="space-y-4">
              {/* Existing content moderation items */}
              <div className="border-l-4 border-yellow-500 pl-4 py-3 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Reported Question</h3>
                    <p className="text-sm text-gray-600">Inappropriate content detected</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Spam Report</h3>
                    <p className="text-sm text-gray-600">Multiple spam answers from user</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* New section for Profanity Flagged Questions */}
              <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Profanity Flagged Questions</h3>
              {loadingQuestions && <p>Loading flagged questions...</p>}
              {errorQuestions && <p className="text-red-500">{errorQuestions}</p>}
              {!loadingQuestions && allQuestions.length === 0 && (
                <p className="text-gray-600">No questions flagged for profanity.</p>
              )}
              <div className="space-y-4">
                {allQuestions.map((question) => (
                  <div key={question._id} className={`border-l-4 ${question.hasProfanity ? 'border-red-500' : question.isApproved ? 'border-green-500' : 'border-gray-300'} pl-4 py-3 bg-white rounded-lg shadow-sm`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{question.title}</h4>
                        <p className="text-sm text-gray-700 mt-1" dangerouslySetInnerHTML={{ __html: question.description }}></p>
                        <p className="text-xs text-gray-500 mt-2">
                          Author: {question.author?.name || 'Unknown'} ({question.author?.email || 'N/A'})
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${question.hasProfanity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            Profanity: {question.hasProfanity ? 'Yes' : 'No'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${question.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            Approved: {question.isApproved ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {!question.isApproved && (
                          <button
                            onClick={() => handleApproveQuestion(question._id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200"
                            title="Approve Question"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                          title="Delete Question"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Profanity Flagged Answers Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profanity Flagged Answers</h2>
            <div className="space-y-4">
              {loadingAnswers && <p>Loading flagged answers...</p>}
              {errorAnswers && <p className="text-red-500">{errorAnswers}</p>}
              {!loadingAnswers && allAnswers.length === 0 && (
                <p className="text-gray-600">No answers flagged for profanity.</p>
              )}
              <div className="space-y-4">
                {allAnswers.map((answer) => (
                  <div key={answer._id} className={`border-l-4 ${answer.hasProfanity ? 'border-red-500' : answer.isApproved ? 'border-green-500' : 'border-gray-300'} pl-4 py-3 bg-white rounded-lg shadow-sm`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Answer to: {answer.question?.title || 'N/A'}</h4>
                        <p className="text-sm text-gray-700 mt-1" dangerouslySetInnerHTML={{ __html: answer.content }}></p>
                        <p className="text-xs text-gray-500 mt-2">
                          Author: {answer.author?.name || 'Unknown'} ({answer.author?.email || 'N/A'})
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${answer.hasProfanity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            Profanity: {answer.hasProfanity ? 'Yes' : 'No'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${answer.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            Approved: {answer.isApproved ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {!answer.isApproved && (
                          <button
                            onClick={() => handleApproveAnswer(answer._id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200"
                            title="Approve Answer"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAnswer(answer._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                          title="Delete Answer"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}