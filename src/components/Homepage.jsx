'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import parse from 'html-react-parser';
import { 
  ArrowUp, 
  ArrowDown,
  Clock, 
  Tag,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function HomePage() {
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
      imageHTML = `<img src="${originalSrc}" class="object-cover max-h-[100px] float-left mr-4 mb-2 border-2 border-gray-200" alt="Question image" />`;
      
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
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    params.set('page', '1'); // Reset to first page when changing filter
    router.push(`/?${params.toString()}`);
  };
  
  // Update URL when page changes
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/?${params.toString()}`);
  };
  
  // Filter by tag
  const handleTagClick = (tag) => {
    const params = new URLSearchParams(searchParams.toString());
    
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

  // Debug timestamp for reference
  const debugTimestamp = "2025-07-12 08:50:33";
  const debugUser = "devang-vala";

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Questions List */}
        <div className="flex-1">
          {/* Header with filters and ask question button (mobile) */}
          <div className="bg-white border-2 border-gray-200 p-4 mb-4 flex flex-wrap justify-between items-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-4 py-2 transition-colors ${
                    filter === currentFilter
                      ? 'bg-gray-100 text-black font-medium border-b-2 border-[#00d447]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {/* Mobile Ask Question Button */}
            {session && (
              <Link href="/ask-question" className="block sm:hidden">
                <button className="px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" /> Ask
                </button>
              </Link>
            )}
          </div>

          {/* Current Tag Filter */}
          {currentTag && (
            <div className="mb-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Filtered by:</span>
                <div 
                  className="bg-gray-100 border-2 border-gray-200 text-gray-800 hover:bg-gray-200 cursor-pointer px-3 py-1 flex items-center shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)]"
                  onClick={() => handleTagClick(currentTag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {currentTag}
                  <span className="ml-1 font-medium">×</span>
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-60 bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="w-8 h-8 border-4 border-[#00d447] border-t-transparent animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading questions...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                <h2 className="text-xl font-medium text-gray-700">No questions found</h2>
                <p className="mt-2 text-gray-500">
                  {currentTag 
                    ? "Try a different tag or filter" 
                    : "Be the first to ask a question!"}
                </p>
                <Link href="/ask-question" className="mt-4 inline-block">
                  <button className="px-4 py-2 mt-4 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    Ask a Question
                  </button>
                </Link>
              </div>
            ) : (
              questions.map((question) => (
                <div 
                  key={question._id} 
                  className="bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                >
                  <div className="flex p-4">
                    {/* Vote controls - Reddit style */}
                    <div className="flex flex-col items-center mr-4">
                      <button className="text-gray-400 hover:text-[#00d447] transition-colors">
                        <ArrowUp className="h-6 w-6" />
                      </button>
                      <span className="text-sm font-medium my-1 text-gray-800">{question.votes}</span>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <ArrowDown className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* Question content */}
                    <div className="flex-grow">
                      <Link href={`/questions/${question._id}`}>
                        <h2 className="text-xl font-medium text-gray-900 hover:text-[#00d447] transition-colors">
                          {question.title}
                        </h2>
                      </Link>
                      
                      <div className="mt-2 text-gray-600 prose prose-sm max-w-none overflow-hidden">
                        {parse(getHTMLPreview(question.description))}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500 gap-4">
                        {/* Metadata */}
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{question.answers?.length || 0} answers</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>
                            {question.createdAt ? 
                              formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 
                              'Unknown date'}
                          </span>
                        </div>
                        
                        {/* Author info */}
                        {question.author && (
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-1 bg-gray-200 flex items-center justify-center text-gray-600 text-xs border border-gray-300">
                              {question.author.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-gray-600">{question.author.name || 'Anonymous'}</span>
                          </div>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 ml-auto">
                          {question.tags?.map(tag => (
                            <div 
                              key={tag} 
                              className="bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 cursor-pointer px-2 py-1 text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTagClick(tag);
                              }}
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
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
              <div className="flex items-center space-x-1 bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
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
                
                <div className="flex items-center">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    // Simple pagination display
                    let pageNum;
                    
                    if (pagination.totalPages <= 5) {
                      // Show all pages if 5 or fewer
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      // At start
                      if (i < 4) {
                        pageNum = i + 1;
                      } else {
                        pageNum = pagination.totalPages;
                      }
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      // At end
                      if (i === 0) {
                        pageNum = 1;
                      } else {
                        pageNum = pagination.totalPages - (4 - i);
                      }
                    } else {
                      // In middle
                      if (i === 0) {
                        pageNum = 1;
                      } else if (i === 4) {
                        pageNum = pagination.totalPages;
                      } else {
                        pageNum = pagination.page + (i - 2);
                      }
                    }
                    
                    // Add ellipsis
                    if ((i === 1 && pageNum !== 2) || (i === 3 && pageNum !== pagination.totalPages - 1)) {
                      return (
                        <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                      );
                    }
                    
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
                </div>
                
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

        {/* Sidebar */}
        <div className="lg:w-72 space-y-4">
          {/* Popular Tags */}
          <div className="bg-white border-2 border-gray-200 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
            <h3 className="font-medium text-gray-900 mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'React', 'NextJS', 'CSS', 'Node.js', 'MongoDB', 'Python', 'SQL'].map((tag) => (
                <div 
                  key={tag} 
                  className="bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 cursor-pointer px-2 py-1 text-sm hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all"
                  onClick={() => handleTagClick(tag.toLowerCase())}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}