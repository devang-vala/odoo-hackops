"use client";

import { useState } from 'react';

const ContentFilter = ({ 
  onFilterChange, 
  currentFilter = 'newest', 
  type = 'answer', // 'answer' or 'comment'
  size = 'medium' // 'small' or 'medium'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getFilterOptions = () => {
    const baseOptions = [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'mine', label: type === 'answer' ? 'My Answers' : 'My Comments' },
    ];

    // Add top-voted option only for answers
    if (type === 'answer') {
      baseOptions.splice(2, 0, { value: 'top-voted', label: 'Top Voted' });
    }

    return baseOptions;
  };

  const filterOptions = getFilterOptions();

  const handleFilterChange = (filterValue) => {
    onFilterChange(filterValue);
    setIsOpen(false);
  };

  const getCurrentFilterLabel = () => {
    const current = filterOptions.find(option => option.value === currentFilter);
    return current ? current.label : 'Sort by';
  };

  const getButtonClasses = () => {
    const baseClasses = "flex items-center gap-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    
    if (size === 'small') {
      return `${baseClasses} px-3 py-1.5 text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100`;
    }
    
    return `${baseClasses} px-4 py-2 text-gray-700 bg-white border-gray-300 hover:bg-gray-50`;
  };

  const getDropdownWidth = () => {
    return size === 'small' ? 'w-40' : 'w-48';
  };

  const getIconSize = () => {
    return size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={getButtonClasses()}
      >
        <span>{getCurrentFilterLabel()}</span>
        <svg
          className={`${getIconSize()} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 z-10 mt-1 ${getDropdownWidth()} bg-white border border-gray-300 rounded-md shadow-lg`}>
          <div className="py-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentFilter === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentFilter; 