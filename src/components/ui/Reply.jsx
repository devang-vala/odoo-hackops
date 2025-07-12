"use client";

import { formatDistanceToNow } from 'date-fns';

const Reply = ({ reply }) => {
  const displayName = reply.author?.username || reply.author?.name || 'Anonymous';

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 ml-8">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-gray-600">
          by <strong>{displayName}</strong>
        </span>
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
        </span>
      </div>
      
      <div 
        className="prose max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: reply.content }}
      />
    </div>
  );
};

export default Reply;
