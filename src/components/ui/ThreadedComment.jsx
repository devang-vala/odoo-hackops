"use client";

import { useState } from 'react';

const ThreadedComment = ({ 
  comment, 
  onReply, 
  currentUserId, 
  depth = 0,
  maxDepth = 3,
  openReply,
  closeReply,
  isReplying
}) => {
  // Only state needed is for showing/hiding nested replies
  const [showReplies, setShowReplies] = useState(true);
  
  const canReply = depth < maxDepth && currentUserId && comment.author?._id !== currentUserId;
  const displayName = comment.author?.username || comment.author?.name || 'Anonymous';

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-gray-600">
            by <strong>{displayName}</strong>
          </span>
          <span className="text-sm text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-800 mb-3">{comment.content}</p>
        
        <div className="flex gap-2 text-sm">
          {/* Only show reply button if user can reply to this comment */}
          {canReply && (
            <button
              onClick={() => openReply(comment.question ? 'question' : 'answer', comment._id, displayName)}
              className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
            >
              Reply
            </button>
          )}
          
          {/* Toggle showing replies */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
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
              openReply={openReply}
              closeReply={closeReply}
              isReplying={isReplying && reply._id === isReplying.commentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadedComment;