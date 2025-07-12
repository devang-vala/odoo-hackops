'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import parse from 'html-react-parser';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  ArrowUp, 
  Clock, 
  Tag,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function QuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse query parameters
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';
  
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
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  
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
      // This is a simple approach - a more advanced approach would parse the DOM tree
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
      
      if (currentTag) {
        queryParams.set('tag', currentTag);
      }
      
      if (currentSearch) {
        queryParams.set('search', currentSearch);
      }
      
      // Fetch data
      const response = await fetch(`/api/questions?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'An error occurred while fetching questions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update URL when page changes
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/questions?${params.toString()}`);
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    
    // Reset to first page when searching
    params.set('page', '1');
    
    router.push(`/questions?${params.toString()}`);
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
    
    router.push(`/questions?${params.toString()}`);
  };
  
  // Fetch questions when parameters change
  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, currentTag, currentSearch]);
  
  // Update search input when URL search param changes
  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
        <Link href="/ask-question">
          <Button className="bg-purple-600 hover:bg-purple-700">
            Ask Question
          </Button>
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        
        {currentTag && (
          <div className="mt-4">
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
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && questions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">No questions found</h2>
          <p className="mt-2 text-gray-500">
            {currentSearch || currentTag 
              ? "Try adjusting your search or filters" 
              : "Be the first to ask a question!"}
          </p>
          <Link href="/ask-question" className="mt-4 inline-block">
            <Button className="bg-purple-600 hover:bg-purple-700 mt-4">
              Ask a Question
            </Button>
          </Link>
        </div>
      )}
      
      {/* Questions list */}
      {!isLoading && !error && questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex">
                  {/* Vote count */}
                  <div className="flex flex-col items-center mr-6">
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
                    <div className="mt-4 flex justify-between items-center">
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
            </div>
          ))}
        </div>
      )}
      
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
            
            <div className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
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
  );
}

function LoadingFallback() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    </Layout>
  );
}

export default function QuestionsPage() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <QuestionsContent />
      </Suspense>
    </Layout>
  );
}