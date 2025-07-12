"use client";

import { useState } from 'react';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const VotingControls = ({ 
  type, 
  itemId, 
  votes, 
  userVote, 
  onVote, 
  isAccepted,
  onAccept,
  canAccept,
  loading 
}) => {
  const [voting, setVoting] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const handleVote = async (value) => {
    if (voting) return;
    
    setVoting(true);
    try {
      await onVote(type, itemId, value);
    } catch (error) {
      toast.error('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleAccept = async () => {
    if (accepting) return;
    
    setAccepting(true);
    try {
      await onAccept(itemId);
    } catch (error) {
      toast.error('Failed to accept answer');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        className={`p-1 hover:bg-gray-100 ${
          userVote === 1 ? 'bg-green-100 text-green-600' : 'text-gray-500'
        }`}
        disabled={voting || loading}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>

      {/* Vote Count */}
      <span className="text-lg font-semibold text-gray-700 min-w-[2rem] text-center">
        {votes || 0}
      </span>

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        className={`p-1 hover:bg-gray-100 ${
          userVote === -1 ? 'bg-red-100 text-red-600' : 'text-gray-500'
        }`}
        disabled={voting || loading}
      >
        <ArrowDown className="h-5 w-5" />
      </Button>

      {/* Accept Answer Button (only for answers) */}
      {type === 'answer' && canAccept && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAccept}
          className={`p-1 mt-2 hover:bg-gray-100 ${
            isAccepted ? 'bg-green-100 text-green-600' : 'text-gray-500'
          }`}
          disabled={accepting || loading}
          title={isAccepted ? 'Answer accepted' : 'Accept this answer'}
        >
          <Check className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default VotingControls;
