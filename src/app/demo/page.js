"use client";

import { useState } from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor/RichTextEditor';

export default function SomePage() {
  const [content, setContent] = useState('');
  
  return (
    <div>
      <h2>Write your content</h2>
      <RichTextEditor 
        content={content}
        onChange={setContent}
        placeholder="Start typing..."
      />
      
      {/* You can access the HTML content directly from the content variable */}
      <div>
        <h3>Preview:</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}