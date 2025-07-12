'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import parse from 'html-react-parser';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Award, 
  ArrowUp, 
  Clock, 
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse query parameters
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentTag = searchParams.get('tag') || '';
  const currentFilter = searchParams.get('filter') || 'Newest';
  
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalQuestions: 0,
    totalPages: 1,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters for questions
  const filters = ["Newest", "Unanswered", "Popular", "Hot"];
  
  // Get HTML preview while preserving formatting
  const getHTMLPreview = (html, maxLength = 150) => {
    if (!html) return '';
    
    // Create a temporary div to work with the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extract the first image if it exists
    const firstImage = tempDiv.querySelector('img');
    let imageHTML = '';
    
    if (firstImage) {
      // Get the original image element
      const originalSrc = firstImage.getAttribute('src');
      
      // Create a modified version with responsive classes
      imageHTML = `<img src="${originalSrc}" class="rounded-md object-cover max-h-[100px] float-left mr-4 mb-2" alt="Question image" />`;
      
      // Remove the image from the text content to avoid duplication
      firstImage.parentNode.removeChild(firstImage);
    }
    
    // Get text content for length checking
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    let truncated = false;
    
    // Check if we need to truncate
    if (textContent.length > maxLength) {
      truncated = true;
      
      // Truncate the HTML content more carefully
      let currentLength = 0;
      let truncatedHTML = '';
      
      function processNode(node) {
        if (currentLength >= maxLength) return;
        
        if (node.nodeType === Node.TEXT_NODE) {
          const remainingLength = maxLength - currentLength;
          if (node.textContent.length <= remainingLength) {
            truncatedHTML += node.textContent;
            currentLength += node.textContent.length;
          } else {
            truncatedHTML += node.textContent.substring(0, remainingLength);
            currentLength = maxLength;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();
          const openTag = `<${tag}${Array.from(node.attributes)
            .map(attr => ` ${attr.name}="${attr.value}"`)
            .join('')}>`;
          
          truncatedHTML += openTag;
          
          for (const childNode of node.childNodes) {
            if (currentLength < maxLength) {
              processNode(childNode);
            }
          }
          
          truncatedHTML += `</${tag}>`;
        }
      }
      
      for (const childNode of tempDiv.childNodes) {
        if (currentLength < maxLength) {
          processNode(childNode);
        }
      }
      
      return imageHTML + truncatedHTML + (truncated ? '...' : '');
    }
    
    // If no truncation needed, return the full HTML content with the extracted image
    return imageHTML + tempDiv.innerHTML;
  };
  
  // Fetch questions with current filters and pagination
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '10');
      
      // Add sort option based on filter
      if (currentFilter === 'Newest') {
        queryParams.set('sort', 'createdAt');
        queryParams.set('order', 'desc');
      } else if (currentFilter === 'Popular') {
        queryParams.set('sort', 'votes');
        queryParams.set('order', 'desc');
      } else if (currentFilter === 'Unanswered') {
        queryParams.set('unanswered', 'true');
      } else if (currentFilter === 'Hot') {
        queryParams.set('sort', 'views');
        queryParams.set('order', 'desc');
      }
      
      if (currentTag) {
        queryParams.set('tag', currentTag);
      }
      
      // Fetch data
      const response = await fetch(`/api/questions?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      
      console.log('Fetched questions:', data);
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'An error occurred while fetching questions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change the active filter
  const handleFilterChange = (filter) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', filter);
    params.set('page', '1'); // Reset to first page when changing filter
    router.push(`/?${params.toString()}`);
  };
  
  // Update URL when page changes
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/?${params.toString()}`);
  };
  
  // Filter by tag
  const handleTagClick = (tag) => {
    const params = new URLSearchParams(searchParams);
    
    // Toggle tag filter
    if (currentTag === tag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    
    // Reset to first page when changing tag filter
    params.set('page', '1');
    
    router.push(`/?${params.toString()}`);
  };
  
  // Fetch questions when parameters change
  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, currentTag, currentFilter]);
  
  // The current date and time for debugging
  const debugInfo = {
    date: '2025-07-12 06:59:47',
    user: 'devang-vala'
  };

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
                  onClick={() => handleFilterChange(filter)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    filter === currentFilter
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Current Tag Filter */}
            {currentTag && (
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Filtered by:</span>
                  <Badge 
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                    onClick={() => handleTagClick(currentTag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {currentTag}
                    <span className="ml-1">×</span>
                  </Badge>
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading questions...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-700">No questions found</h2>
                  <p className="mt-2 text-gray-500">
                    {currentTag 
                      ? "Try a different tag or filter" 
                      : "Be the first to ask a question!"}
                  </p>
                  <Link href="/ask-question" className="mt-4 inline-block">
                    <Button className="bg-purple-600 hover:bg-purple-700 mt-4">
                      Ask a Question
                    </Button>
                  </Link>
                </div>
              ) : (
                questions.map((question) => (
                  <div key={question._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex">
                      {/* Vote count */}
                      <div className="hidden sm:flex flex-col items-center mr-6">
                        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 w-16">
                          <ArrowUp className="h-5 w-5 text-gray-400" />
                          <span className="text-lg font-semibold my-1">{question.votes}</span>
                          <span className="text-xs text-gray-500">votes</span>
                        </div>
                        
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{question.answers?.length || 0}</span>
                        </div>
                      </div>
                      
                      {/* Question content */}
                      <div className="flex-grow">
                        <Link href={`/questions/${question._id}`}>
                          <h2 className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                            {question.title}
                          </h2>
                        </Link>
                        
                        <div className="mt-3 text-gray-600 prose prose-sm max-w-none overflow-hidden">
                          {parse(getHTMLPreview(question.description))}
                        </div>
                        
                        {/* Tags */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {question.tags?.map(tag => (
                            <Badge 
                              key={tag} 
                              className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                              onClick={() => handleTagClick(tag)}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Question metadata */}
                        <div className="mt-4 flex flex-wrap justify-between items-center gap-y-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {question.createdAt ? 
                                formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 
                                'Unknown date'}
                            </span>
                          </div>
                          
                          {/* Author info */}
                          {question.author && (
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
                                  {question.author.name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-700">{question.author.name || 'Anonymous'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                      // Determine which page numbers to show
                      let pageNum;
                      if (pagination.totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        pageNum = i + 1;
                      } else if (pagination.page <= 4) {
                        // Show 1,2,3,4,5,...,totalPages
                        if (i < 5) {
                          pageNum = i + 1;
                        } else if (i === 5) {
                          return (
                            <span key="ellipsis1" className="w-8 text-center">...</span>
                          );
                        } else {
                          pageNum = pagination.totalPages;
                        }
                      } else if (pagination.page >= pagination.totalPages - 3) {
                        // Show 1,...,totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages
                        if (i === 0) {
                          pageNum = 1;
                        } else if (i === 1) {
                          return (
                            <span key="ellipsis2" className="w-8 text-center">...</span>
                          );
                        } else {
                          pageNum = pagination.totalPages - (6 - i);
                        }
                      } else {
                        // Show 1,...,page-1,page,page+1,...,totalPages
                        if (i === 0) {
                          pageNum = 1;
                        } else if (i === 1) {
                          return (
                            <span key="ellipsis3" className="w-8 text-center">...</span>
                          );
                        } else if (i === 5) {
                          return (
                            <span key="ellipsis4" className="w-8 text-center">...</span>
                          );
                        } else if (i === 6) {
                          pageNum = pagination.totalPages;
                        } else {
                          pageNum = pagination.page + (i - 3);
                        }
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasMore}
                    size="sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* User Information */}
            {session ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-100 text-purple-800">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-gray-900">{session.user.name}</h3>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                <Link href="/ask-question">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Ask a Question
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Join the Community</h3>
                <p className="text-gray-600 mb-4">Sign up to ask questions, answer, and interact with the community.</p>
                <Link href="/auth/signup">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
            
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
                  <span 
                    key={tag} 
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                    onClick={() => handleTagClick(tag.toLowerCase())}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Debug Info (Hidden in Production) */}
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
              <p>User: {debugInfo.user}</p>
              <p>Time: {debugInfo.date}</p>
              <p>Current Page: {currentPage}</p>
              <p>Current Filter: {currentFilter}</p>
              {currentTag && <p>Current Tag: {currentTag}</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}