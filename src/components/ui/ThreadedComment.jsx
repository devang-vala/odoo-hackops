"use client";

const Comment = ({ 
  comment, 
  onReply, 
  currentUserId, 
  openReply
}) => {
  const displayName = comment.author?.username || comment.author?.name || 'Anonymous';
  const canReply = currentUserId && comment.author?._id !== currentUserId;

  return (
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
      </div>
    </div>
  );
};

export default Comment;
