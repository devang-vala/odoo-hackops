'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import parse from 'html-react-parser';
import { 
  MessageSquare, 
  ArrowUp, 
  ArrowDown,
  Clock, 
  Tag,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse query parameters
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentTag = searchParams.get('tag') || '';
  
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalResults: 0,
    totalPages: 1,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query);
  
  // Get HTML preview while preserving formatting
  const getHTMLPreview = (html, maxLength = 250) => {
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
  
  // Fetch search results with current filters and pagination
  const fetchResults = async () => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.set('q', query);
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '10');
      
      if (currentTag) {
        queryParams.set('tag', currentTag);
      }
      
      // Fetch data
      const response = await fetch(`/api/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setPagination({
        page: currentPage,
        limit: 10,
        totalResults: data.results?.length || 0,
        totalPages: Math.ceil((data.results?.length || 0) / 10),
        hasMore: currentPage < Math.ceil((data.results?.length || 0) / 10)
      });
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(err.message || 'An error occurred while fetching search results');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update URL when page changes
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    // Reset to first page when searching
    params.set('page', '1');
    
    router.push(`/search?${params.toString()}`);
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
    
    router.push(`/search?${params.toString()}`);
  };
  
  // Fetch results when parameters change
  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, currentTag]);
  
  // Update search input when URL query param changes
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Results List */}
        <div className="flex-1">
          {/* Search header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center text-sm mb-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to home
              </Link>
              <h1 className="text-2xl font-bold">
                {query ? (
                  <>
                    Search results for: <span className="text-[#00d447]">"{query}"</span>
                  </>
                ) : (
                  'Search'
                )}
              </h1>
              <p className="text-gray-500 mt-1">
                {isLoading ? 'Searching...' : 
                  (results.length > 0 ? `Found ${results.length} results` : 'No results found')}
              </p>
            </div>
            
            {/* Search input */}
            <div className="w-full md:w-auto md:min-w-[300px]">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-[#00d447] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                  type="submit" 
                  className="px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
                >
                  Search
                </button>
              </form>
            </div>
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

          {/* Results */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-60 bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="w-8 h-8 border-4 border-[#00d447] border-t-transparent animate-spin"></div>
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : !query ? (
              <div className="text-center py-12 bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-700">Enter a search term to find questions</h2>
                <p className="mt-2 text-gray-500">
                  Search by title, content or tags
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-700">No results found for "{query}"</h2>
                <p className="mt-2 text-gray-500">
                  Try different keywords or check your spelling
                </p>
                <Link href="/" className="mt-4 inline-block">
                  <button className="px-4 py-2 mt-4 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    Back to Home
                  </button>
                </Link>
              </div>
            ) : (
              results.map((result) => (
                <div 
                  key={result._id} 
                  className="bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                >
                  <div className="flex p-4">
                    {/* Vote controls - Reddit style */}
                    <div className="flex flex-col items-center mr-4">
                      <button className="text-gray-400 hover:text-[#00d447] transition-colors">
                        <ArrowUp className="h-6 w-6" />
                      </button>
                      <span className="text-sm font-medium my-1 text-gray-800">{result.votes}</span>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <ArrowDown className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* Question content */}
                    <div className="flex-grow">
                      <Link href={`/questions/${result._id}`}>
                        <h2 className="text-xl font-medium text-gray-900 hover:text-[#00d447] transition-colors">
                          {result.highlightedTitle ? 
                            parse(result.highlightedTitle) : 
                            result.title}
                        </h2>
                      </Link>
                      
                      <div className="mt-2 text-gray-600 prose prose-sm max-w-none overflow-hidden">
                        {parse(getHTMLPreview(result.description))}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500 gap-4">
                        {/* Metadata */}
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{result.answers || 0} answers</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>
                            {result.createdAt ? 
                              formatDistanceToNow(new Date(result.createdAt), { addSuffix: true }) : 
                              'Unknown date'}
                          </span>
                        </div>
                        
                        {/* Author info */}
                        {result.author && (
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-1 bg-gray-200 flex items-center justify-center text-gray-600 text-xs border border-gray-300">
                              {result.author?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-gray-600">{result.author || 'Anonymous'}</span>
                          </div>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 ml-auto">
                          {result.tags?.map(tag => (
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
          {!isLoading && !error && results.length > 0 && pagination.totalPages > 1 && (
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
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#00d447] border-t-transparent animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading search results...</span>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SearchContent />
    </Suspense>
  );
}