'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Search, Tag, Clock, ArrowRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import parse from 'html-react-parser';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const searchRef = useRef(null);
  
  // Search for questions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    const performSearch = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`);
        
        if (response.ok) {
          const data = await response.json();
          setResults(data.results);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [debouncedQuery]);
  
  // Handle keyboard navigation for dropdown
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    // Down arrow
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    }
    
    // Up arrow
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    }
    
    // Enter to navigate to selected result
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/questions/${results[selectedIndex]._id}`);
        setIsOpen(false);
        setQuery('');
      } else if (query.trim()) {
        // If nothing selected but there's a query, go to search results page
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    }
    
    // Escape to close dropdown
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle clearing the search
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };
  
  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search questions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-[#00d447] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]"
        />
        {query && (
          <button 
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-[#00d447] border-t-transparent animate-spin"></div>
        </div>
      )}
      
      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          {results.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <Link 
                    href={`/questions/${result._id}`}
                    key={result._id}
                    onClick={() => setIsOpen(false)}
                  >
                    <div 
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedIndex === index ? 'bg-gray-50' : ''
                      }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          {/* Title with highlighted match */}
                          <h3 className="font-medium text-gray-900">
                            {result.highlightedTitle ? 
                              parse(result.highlightedTitle) : 
                              result.title}
                          </h3>
                          
                          {/* Metadata */}
                          <div className="flex items-center mt-2 text-xs text-gray-500 flex-wrap gap-2">
                            {/* Author */}
                            <span>by {result.author}</span>
                            
                            {/* Date */}
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {result.createdAt ? 
                                formatDistanceToNow(new Date(result.createdAt), { addSuffix: true }) : 
                                'Unknown date'}
                            </span>
                            
                            {/* Tags */}
                            {result.tags && result.tags.length > 0 && (
                              <span className="flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                {result.tags.slice(0, 3).join(', ')}
                                {result.tags.length > 3 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Score indicator */}
                        <div className={`
                          w-1 h-12 ml-2
                          ${result.score >= 3 ? 'bg-[#00d447]' : 
                            (result.score >= 2 ? 'bg-[#00d447]/60' : 'bg-gray-300')}
                        `}></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* View all results link */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <Link 
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center text-sm text-[#00d447] hover:underline"
                >
                  View all results
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {debouncedQuery.trim().length >= 2 ? (
                <>
                  <p>No results found for "{debouncedQuery}"</p>
                  <p className="text-sm mt-1">Try different keywords or check spelling</p>
                </>
              ) : (
                <p>Type at least 2 characters to search</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}