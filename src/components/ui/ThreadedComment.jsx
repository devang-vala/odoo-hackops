"use client";

import { useState } from 'react';

const ThreadedComment = ({ 
  comment, 
  onReply, 
  currentUserId, 
  depth = 0,
  maxDepth = 3 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    onReply(comment._id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  };

  const canReply = depth < maxDepth && currentUserId;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-gray-600">
            by <strong>{comment.author?.username}</strong>
          </span>
          <span className="text-sm text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-800 mb-3">{comment.content}</p>
        
        <div className="flex gap-2 text-sm">
          {canReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-blue-600 hover:text-blue-800"
            >
              Reply
            </button>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="mt-3 p-3 bg-white rounded border">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-2 border rounded-md resize-none text-sm"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <ThreadedComment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              currentUserId={currentUserId}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadedComment; 