import { useState, useEffect, useCallback } from 'react';

export const useContentFilter = (contentType, questionId, userId = null) => {
  const [filter, setFilter] = useState('newest');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async (currentFilter) => {
    if (!questionId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filter: currentFilter,
        ...(userId && { userId })
      });

      const response = await fetch(`/api/questions/${questionId}/${contentType}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${contentType}`);
      }

      const data = await response.json();
      setContent(data[contentType] || []);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${contentType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [contentType, questionId, userId]);

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  useEffect(() => {
    fetchContent(filter);
  }, [filter, fetchContent]);

  const refreshContent = useCallback(() => {
    fetchContent(filter);
  }, [fetchContent, filter]);

  return {
    filter,
    content,
    loading,
    error,
    handleFilterChange,
    refreshContent
  };
}; 