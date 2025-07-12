"use client";

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Common emojis array
const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", 
  "😉", "😊", "😇", "🥰", "😍", "😘", "😗", "😚", "😙", "😋", 
  "😛", "😜", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
  "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "❣️", "💕", "💞",
  "👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤞",
  "🎉", "🎊", "🎈", "🎂", "🎁", "🎄", "🎯", "🏆", "🏅", "🥇"
];

export function EmojiPicker({ onEmojiSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={ref} 
      className="absolute z-10 bg-white border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-3 max-w-xs"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
    >
      <div className="absolute top-2 right-2">
        <button 
          onClick={onClose}
          className="flex items-center justify-center h-6 w-6 bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex flex-wrap gap-1 pt-8 pb-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onEmojiSelect(emoji)}
            className="text-xl hover:bg-gray-100 p-2 cursor-pointer transition-all hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}