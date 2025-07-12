'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { 
  Users, 
  FileQuestion, 
  Flag, 
  Activity,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash,
  Edit,
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import parse from 'html-react-parser';

function AdminDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    pendingReports: 0,
    dailyActiveUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
    hasMore: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  
  // Content moderation states (from original code)
  const [allQuestions, setAllQuestions] = useState([]);
  const [allAnswers, setAllAnswers] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [errorQuestions, setErrorQuestions] = useState(null);
  const [errorAnswers, setErrorAnswers] = useState(null);
  const [error, setError] = useState(null);
  
  // Check authentication and load data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    // Load admin data when authenticated
    fetchStats();
    fetchUsers();
    fetchAllQuestions();
    fetchAllAnswers();
    
  }, [session, status, router]);
  
  // Fetch admin stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics');
      }
      
      const data = await response.json();
      setStats({
        totalUsers: data.totalUsers || 0,
        totalQuestions: data.totalQuestions || 0,
        pendingReports: data.pendingReports || 0,
        dailyActiveUsers: data.dailyActiveUsers || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    }
  };
  
  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Build query string for users
      const queryParams = new URLSearchParams();
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());
      
      if (searchQuery) {
        queryParams.set('search', searchQuery);
      }
      
      if (roleFilter) {
        queryParams.set('role', roleFilter);
      }
      
      queryParams.set('sort', sortConfig.key);
      queryParams.set('order', sortConfig.direction);
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Content moderation functions from original code
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
  
  // Sort users
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset pagination when searching
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Fetch data when pagination or sorting changes
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [pagination.page, sortConfig, session?.user?.role]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-4 border-[#00d447] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Redirect handled in useEffect
  if (!session || session.user.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Admin Dashboard 🛡️
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome, {session.user.name}! You have admin privileges.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-800">
              <span className="text-2xl font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-center">
            <div className="p-3 border-2 border-blue-100 bg-blue-50">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Total Users</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        {/* Total Questions */}
        <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-center">
            <div className="p-3 border-2 border-purple-100 bg-purple-50">
              <FileQuestion className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Total Questions</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
            </div>
          </div>
        </div>
        
        {/* Pending Reports */}
        <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-center">
            <div className="p-3 border-2 border-red-100 bg-red-50">
              <Flag className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Pending Reports</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
            </div>
          </div>
        </div>
        
        {/* Daily Active Users */}
        <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-center">
            <div className="p-3 border-2 border-[#00d447] bg-green-50">
              <Activity className="h-6 w-6 text-[#00d447]" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Daily Active Users</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.dailyActiveUsers}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management Section */}
        <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold">User Management</h2>
          </div>
          
          {/* Search and Filter */}
          <div className="p-6 border-b-2 border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex-grow max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-[#00d447] shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)]"
                  />
                </div>
              </form>
              
              {/* Role Filter */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-[#00d447] shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] appearance-none"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
              
              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
              >
                Search
              </button>
              
              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                  fetchUsers();
                }}
                className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-4 font-medium border-b-2 border-gray-200">
                    <button 
                      onClick={() => handleSort('name')} 
                      className="flex items-center focus:outline-none"
                    >
                      Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 font-medium border-b-2 border-gray-200">
                    <button 
                      onClick={() => handleSort('email')} 
                      className="flex items-center focus:outline-none"
                    >
                      Email
                      {sortConfig.key === 'email' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 font-medium border-b-2 border-gray-200">
                    <button 
                      onClick={() => handleSort('role')} 
                      className="flex items-center focus:outline-none"
                    >
                      Role
                      {sortConfig.key === 'role' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 font-medium border-b-2 border-gray-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-4 border-[#00d447] border-t-transparent animate-spin mr-2"></div>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 flex items-center">
                        <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {user.name || 'Anonymous'}
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium border ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          user.role === 'moderator' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button 
                          className="p-1 text-blue-600 hover:bg-blue-50"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-red-600 hover:bg-red-50"
                          title="Delete user"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex justify-center p-4">
              <div className="flex items-center space-x-1 bg-white border-2 border-gray-200 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)]">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`p-2 ${
                    pagination.page === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center ${
                        pageNum === pagination.page 
                          ? 'bg-[#00d447] text-white border-2 border-[#00d447]' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  className={`p-2 ${
                    !pagination.hasMore 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profanity Flagged Questions */}
        <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold">Profanity Flagged Questions</h2>
          </div>
          
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {loadingQuestions ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-4 border-[#00d447] border-t-transparent animate-spin mr-2"></div>
                <span>Loading flagged questions...</span>
              </div>
            ) : errorQuestions ? (
              <div className="bg-red-50 border-2 border-red-200 p-4">
                <p className="text-red-700">{errorQuestions}</p>
              </div>
            ) : allQuestions.length === 0 ? (
              <div className="text-center py-8 border-2 border-gray-100">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No questions flagged for profanity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allQuestions.map((question) => (
                  <div 
                    key={question._id} 
                    className="border-l-4 border-red-500 pl-4 py-4 bg-white border-t border-r border-b border-gray-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{question.title}</h3>
                        <div className="mt-2 text-sm text-gray-700">
                          {parse(question.description)}
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Author: {question.author?.name || 'Unknown'} ({question.author?.email || 'N/A'})
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2 py-1 text-xs font-medium border border-red-200 bg-red-50 text-red-700">
                            Profanity: Yes
                          </span>
                          <span className="px-2 py-1 text-xs font-medium border border-yellow-200 bg-yellow-50 text-yellow-700">
                            Approved: No
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 justify-end">
                        <button
                          onClick={() => handleApproveQuestion(question._id)}
                          className="border-2 border-[#00d447] bg-white hover:bg-[#00d447] text-[#00d447] hover:text-white p-2 flex items-center justify-center hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                          title="Approve Question"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="border-2 border-red-500 bg-white hover:bg-red-500 text-red-500 hover:text-white p-2 flex items-center justify-center hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                          title="Delete Question"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Profanity Flagged Answers */}
        <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] lg:col-span-2">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold">Profanity Flagged Answers</h2>
          </div>
          
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {loadingAnswers ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-4 border-[#00d447] border-t-transparent animate-spin mr-2"></div>
                <span>Loading flagged answers...</span>
              </div>
            ) : errorAnswers ? (
              <div className="bg-red-50 border-2 border-red-200 p-4">
                <p className="text-red-700">{errorAnswers}</p>
              </div>
            ) : allAnswers.length === 0 ? (
              <div className="text-center py-8 border-2 border-gray-100">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No answers flagged for profanity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allAnswers.map((answer) => (
                  <div 
                    key={answer._id} 
                    className="border-l-4 border-red-500 pl-4 py-4 bg-white border-t border-r border-b border-gray-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">Answer to: {answer.question?.title || 'N/A'}</h3>
                        <div className="mt-2 text-sm text-gray-700">
                          {parse(answer.content)}
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Author: {answer.author?.name || 'Unknown'} ({answer.author?.email || 'N/A'})
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2 py-1 text-xs font-medium border border-red-200 bg-red-50 text-red-700">
                            Profanity: Yes
                          </span>
                          <span className="px-2 py-1 text-xs font-medium border border-yellow-200 bg-yellow-50 text-yellow-700">
                            Approved: No
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 justify-end">
                        <button
                          onClick={() => handleApproveAnswer(answer._id)}
                          className="border-2 border-[#00d447] bg-white hover:bg-[#00d447] text-[#00d447] hover:text-white p-2 flex items-center justify-center hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                          title="Approve Answer"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteAnswer(answer._id)}
                          className="border-2 border-red-500 bg-white hover:bg-red-500 text-red-500 hover:text-white p-2 flex items-center justify-center hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                          title="Delete Answer"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense wrapper with loading state
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="w-8 h-8 border-4 border-[#00d447] border-t-transparent animate-spin"></div>
      <span className="ml-2">Loading admin dashboard...</span>
    </div>
  );
}

// Main component that wraps the admin content with layout and suspense
export default function AdminDashboard() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <AdminDashboardContent />
      </Suspense>
    </Layout>
  );
}