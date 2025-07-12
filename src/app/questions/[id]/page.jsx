'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import parse from 'html-react-parser';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Clock, 
  Tag,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const [comment, setComment] = useState('');
  const router = useRouter();

  // Fetch question data from the backend
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        
        
        const response = await fetch(`/api/questions/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch question');
        }
        
        const data = await response.json();
        console.log('Question data received:', data);
        
        setQuestion(data);
        setVoteCount(data.votes || 0);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError(err.message || 'An error occurred while fetching the question');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchQuestion();
    }
  }, [id]);

  // Static handlers for voting and commenting
  const handleUpvote = () => {
    setVoteCount(prev => prev + 1);
    // In a real app, you'd make an API call to update the vote in the database
  };

  const handleDownvote = () => {
    setVoteCount(prev => prev - 1);
    // In a real app, you'd make an API call to update the vote in the database
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    alert(`Comment submitted: ${comment}`);
    setComment('');
    // In a real app, you'd make an API call to save the comment
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading question...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Question</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Question Not Found</h2>
          <p className="mt-2 text-gray-500">The question you're looking for doesn't exist or has been removed.</p>
          <Button 
            className="mt-6 bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/questions')}
          >
            Browse All Questions
          </Button>
        </div>
      </Layout>
    );
  }

  // Configuration options for html-react-parser
  const parserOptions = {
    replace: (domNode) => {
      // Add custom replacements for specific elements if needed
      if (domNode.name === 'img' && domNode.attribs) {
        // Make images responsive while preserving their aspect ratio
        return (
          <img 
            src={domNode.attribs.src} 
            alt={domNode.attribs.alt || "Question image"} 
            className="rounded-md max-w-full h-auto my-4"
          />
        );
      }
      
      // Keep other elements as they are
      return undefined;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-gray-500">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="hover:text-purple-600">Home</a></li>
            <li>/</li>
            <li><a href="/questions" className="hover:text-purple-600">Questions</a></li>
            <li>/</li>
            <li className="truncate max-w-[200px] sm:max-w-xs">{question.title}</li>
          </ol>
        </nav>
        
        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Question header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{question.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {question.createdAt ? 
                    formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 
                    'Unknown date'}
                </span>
              </div>
              
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{question.answers?.length || 0} answers</span>
              </div>
              
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{voteCount} votes</span>
              </div>
            </div>
          </div>

          {/* Question body */}
          <div className="flex flex-col md:flex-row p-6">
            {/* Vote controls - Stacked on mobile, side-by-side on desktop */}
            <div className="flex md:flex-col items-center md:mr-6 mb-4 md:mb-0 justify-center md:justify-start">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleUpvote}
                className="h-10 w-10 rounded-full hover:bg-gray-100"
              >
                <ArrowUp className="h-6 w-6 text-gray-500" />
              </Button>
              
              <span className="text-xl font-medium mx-4 md:my-2 md:mx-0 text-gray-700">
                {voteCount}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDownvote}
                className="h-10 w-10 rounded-full hover:bg-gray-100"
              >
                <ArrowDown className="h-6 w-6 text-gray-500" />
              </Button>
              
              <div className="hidden md:flex md:flex-col mt-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full hover:bg-gray-100 mb-2"
                  onClick={() => alert('Bookmark functionality would go here')}
                >
                  <Bookmark className="h-5 w-5 text-gray-500" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full hover:bg-gray-100"
                  onClick={() => alert('Share functionality would go here')}
                >
                  <Share2 className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
            
            {/* Question content */}
            <div className="flex-grow">
              {/* Parse and render the HTML content */}
              <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                {parse(question.description, parserOptions)}
              </div>
              
              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {question.tags?.map(tag => (
                  <div 
                    key={tag} 
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
              
              {/* Mobile action buttons */}
              <div className="flex md:hidden justify-center gap-4 mt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert('Bookmark functionality would go here')}
                  className="flex items-center"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert('Share functionality would go here')}
                  className="flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {/* Author info */}
              <div className="mt-8 flex items-start justify-end">
                <div className="bg-blue-50 rounded-lg p-4 max-w-xs">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 border border-blue-200">
                      <AvatarFallback className="bg-blue-200 text-blue-700">
                        {question.author?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {question.author?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Asked {question.createdAt ? 
                          formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 
                          'some time ago'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="bg-gray-50 p-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
            
            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[100px] mb-3"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!comment.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Post Comment
                </Button>
              </div>
            </form>
            
            {/* Display sample comments */}
            {/* If you have real comments in your data model, you would map through them here */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-200 text-green-700">JD</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      Have you checked the documentation? There's a section about this specific issue.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-200 text-purple-700">AS</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-900">Alice Smith</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      I encountered a similar problem last week. Try updating your dependencies. 👍
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
        
        {/* Answers section - would be populated from question.answers */}
        {question.answers && question.answers.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            
            <div className="space-y-8">
              {question.answers.map(answer => (
                <div key={answer._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="prose max-w-none">
                      {parse(answer.content, parserOptions)}
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Upvote
                        </Button>
                        <span className="text-gray-600">{answer.votes || 0} votes</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                            {answer.author?.name?.[0]?.toUpperCase() || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{answer.author?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">
                            {answer.createdAt ? 
                              formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true }) : 
                              'some time ago'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}