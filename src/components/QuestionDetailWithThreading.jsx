"use client";

import { useState } from 'react';
import { useContentFilter } from '@/lib/hooks/useContentFilter';
import ContentFilter from '@/components/ui/ContentFilter';
import ThreadedComment from '@/components/ui/ThreadedComment';
import { RichTextEditor } from '@/components/ui/rich-text-editor/RichTextEditor';

const QuestionDetailWithThreading = ({ question, currentUserId }) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [showQuestionCommentForm, setShowQuestionCommentForm] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [newQuestionComment, setNewQuestionComment] = useState('');
  const [answerComments, setAnswerComments] = useState({});

  // Use the custom hook for answers
  const {
    filter: answerFilter,
    content: answers,
    loading: answersLoading,
    error: answersError,
    handleFilterChange: handleAnswerFilterChange,
    refreshContent: refreshAnswers
  } = useContentFilter('answers', question._id, currentUserId);

  // Use the custom hook for question comments
  const {
    filter: questionCommentFilter,
    content: questionComments,
    loading: questionCommentsLoading,
    error: questionCommentsError,
    handleFilterChange: handleQuestionCommentFilterChange,
    refreshContent: refreshQuestionComments
  } = useContentFilter('comments', question._id, currentUserId);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      const response = await fetch(`/api/questions/${question._id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newAnswer,
          authorId: currentUserId
        })
      });

      if (response.ok) {
        setNewAnswer('');
        setShowAnswerForm(false);
        refreshAnswers();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleSubmitQuestionComment = async (e) => {
    e.preventDefault();
    if (!newQuestionComment.trim()) return;

    try {
      const response = await fetch(`/api/questions/${question._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newQuestionComment,
          authorId: currentUserId
        })
      });

      if (response.ok) {
        setNewQuestionComment('');
        setShowQuestionCommentForm(false);
        refreshQuestionComments();
      }
    } catch (error) {
      console.error('Error submitting question comment:', error);
    }
  };

  const handleAnswerCommentReply = async (answerId, parentCommentId, content) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorId: currentUserId,
          parentCommentId
        })
      });

      if (response.ok) {
        // Refresh the specific answer's comments
        fetchAnswerComments(answerId);
      }
    } catch (error) {
      console.error('Error submitting answer comment reply:', error);
    }
  };

  const handleQuestionCommentReply = async (parentCommentId, content) => {
    try {
      const response = await fetch(`/api/questions/${question._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorId: currentUserId,
          parentCommentId
        })
      });

      if (response.ok) {
        refreshQuestionComments();
      }
    } catch (error) {
      console.error('Error submitting question comment reply:', error);
    }
  };

  const fetchAnswerComments = async (answerId) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setAnswerComments(prev => ({
          ...prev,
          [answerId]: data.comments
        }));
      }
    } catch (error) {
      console.error('Error fetching answer comments:', error);
    }
  };

  const handleShowAnswerComments = (answerId) => {
    if (!answerComments[answerId]) {
      fetchAnswerComments(answerId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Question Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
        <div 
          className="prose max-w-none mb-4"
          dangerouslySetInnerHTML={{ __html: question.description }}
        />
        <div className="flex gap-2 mb-4">
          {question.tags?.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Asked by {question.author?.username}</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Answers Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Answers ({answers.length})</h2>
          <div className="flex gap-4">
            <ContentFilter 
              type="answer"
              size="medium"
              currentFilter={answerFilter}
              onFilterChange={handleAnswerFilterChange}
            />
            {currentUserId && (
              <button
                onClick={() => setShowAnswerForm(!showAnswerForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showAnswerForm ? 'Cancel' : 'Add Answer'}
              </button>
            )}
          </div>
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <form onSubmit={handleSubmitAnswer} className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-3">Your Answer</h3>
            <RichTextEditor
              content={newAnswer}
              onChange={setNewAnswer}
              placeholder="Write your answer here..."
            />
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Post Answer
              </button>
              <button
                type="button"
                onClick={() => setShowAnswerForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Answers List */}
        {answersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading answers...</p>
          </div>
        ) : answersError ? (
          <div className="text-center py-8 text-red-600">
            <p>Error loading answers: {answersError}</p>
          </div>
        ) : answers.length > 0 ? (
          <div className="space-y-8">
            {answers.map((answer) => (
              <div key={answer._id} className="border-l-4 border-gray-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-600">
                    by <strong>{answer.author?.username}</strong>
                  </span>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Votes: {answer.votes}</span>
                    <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div 
                  className="prose max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />
                
                {/* Answer Comments */}
                <div className="mt-4">
                  <button
                    onClick={() => handleShowAnswerComments(answer._id)}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-3"
                  >
                    {answerComments[answer._id] ? 
                      `Hide Comments (${answerComments[answer._id].length})` : 
                      'Show Comments'
                    }
                  </button>
                  
                  {answerComments[answer._id] && (
                    <div className="space-y-3">
                      {answerComments[answer._id].map((comment) => (
                        <ThreadedComment
                          key={comment._id}
                          comment={comment}
                          onReply={(parentCommentId, content) => 
                            handleAnswerCommentReply(answer._id, parentCommentId, content)
                          }
                          currentUserId={currentUserId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No answers yet. Be the first to answer!</p>
        )}
      </div>

      {/* Question Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Question Comments ({questionComments.length})</h2>
          <div className="flex gap-4">
            <ContentFilter 
              type="comment"
              size="small"
              currentFilter={questionCommentFilter}
              onFilterChange={handleQuestionCommentFilterChange}
            />
            {currentUserId && (
              <button
                onClick={() => setShowQuestionCommentForm(!showQuestionCommentForm)}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                {showQuestionCommentForm ? 'Cancel' : 'Add Comment'}
              </button>
            )}
          </div>
        </div>

        {/* Question Comment Form */}
        {showQuestionCommentForm && (
          <form onSubmit={handleSubmitQuestionComment} className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-3">Your Comment</h3>
            <textarea
              value={newQuestionComment}
              onChange={(e) => setNewQuestionComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Post Comment
              </button>
              <button
                type="button"
                onClick={() => setShowQuestionCommentForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Question Comments List */}
        {questionCommentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        ) : questionCommentsError ? (
          <div className="text-center py-8 text-red-600">
            <p>Error loading comments: {questionCommentsError}</p>
          </div>
        ) : questionComments.length > 0 ? (
          <div className="space-y-4">
            {questionComments.map((comment) => (
              <ThreadedComment
                key={comment._id}
                comment={comment}
                onReply={handleQuestionCommentReply}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No comments yet. Start the discussion!</p>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailWithThreading; 