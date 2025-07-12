'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { RichTextEditor } from '@/components/ui/rich-text-editor/RichTextEditor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Loader2, Tag as TagIcon } from 'lucide-react';

export default function AskQuestion() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00d447] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin?callbackUrl=/ask-question');
    return null;
  }

  // Handle adding tags
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // Handle removing tags
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input keydown
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Tab' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      setError('Please enter a title for your question');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide details for your question');
      return;
    }
    
    if (tags.length === 0) {
      setError('Please add at least one tag');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          tags,
          author: session.user.id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit question');
      }
      
      const data = await response.json();
      
      // Redirect to the new question
      router.push(`/questions/${data.id}`);
    } catch (error) {
      setError(error.message || 'An error occurred while submitting your question');
      console.error('Error submitting question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-600">
            Get help from the community by asking a clear, detailed question
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Question Title */}
          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your programming question? Be specific."
              className="w-full px-4 py-2 border-2 border-gray-200 focus:border-[#00d447] focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your title should summarize the problem you're facing
            </p>
          </div>

          {/* Question Details */}
          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Details <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Provide all the details someone would need to answer your question..."
              minHeight="300px"
              className="border-0"
            />
            <p className="text-xs text-gray-500 mt-2">
              Include code, error messages, and all relevant information
            </p>
          </div>

          {/* Tags */}
          <div className="bg-white border-2 border-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] p-6 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="relative flex-grow">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tags (e.g., javascript, react)"
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-[#00d447] focus:outline-none"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddTag} 
                className="ml-2 px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add up to 5 tags to describe what your question is about
            </p>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <div key={tag} className="bg-gray-100 border-2 border-gray-200 px-2 py-1 flex items-center gap-1">
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center border-t-2 border-gray-200 pt-6">
            
            <div className="flex space-x-4">
              <button 
                type="button" 
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !title.trim() || !description.trim() || tags.length === 0}
                className="px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Submitting...
                  </span>
                ) : (
                  'Post Your Question'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}