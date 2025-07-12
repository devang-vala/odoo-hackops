"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { EmojiPicker } from './EmojiPicker';
import { ImageUpload } from './ImageUpload';
import { Toolbar } from './Toolbar';
import { cn } from '@/lib/utils';

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Write something awesome...',
  className,
  maxHeight = '500px',
  minHeight = '200px',
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

 const addEmoji = useCallback((emoji) => {
  editor?.chain().focus().insertContent(emoji).run();
  setShowEmojiPicker(false);
}, [editor]);

  const handleImageUpload = useCallback(async (file) => {
    // This function would handle the image upload to your server or cloud storage
    // For now, we'll use a placeholder function that returns a data URL
    // In production, you would replace this with actual upload functionality
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }).then((url) => {
      editor?.chain().focus().setImage({ src: url }).run();
    });
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col border rounded-md overflow-hidden",
      isFocused && "ring-2 ring-primary/50",
      className
    )}>
      <Toolbar editor={editor} setShowEmojiPicker={setShowEmojiPicker} imageInputRef={imageInputRef} />
      
      {showEmojiPicker && <EmojiPicker onEmojiSelect={addEmoji} onClose={() => setShowEmojiPicker(false)} />}
      
      <EditorContent 
        editor={editor} 
        className={cn(
          "px-4 py-2 prose prose-sm sm:prose max-w-none overflow-y-auto",
          `max-h-[${maxHeight}] min-h-[${minHeight}]`
        )}
      />
      
      <ImageUpload ref={imageInputRef} onImageUpload={handleImageUpload} />
      
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-white shadow rounded-md p-1">
            <Button 
              size="sm" 
              variant={editor.isActive('bold') ? 'default' : 'ghost'} 
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="p-1 h-8 w-8"
            >
              <span className="font-bold">B</span>
            </Button>
            <Button 
              size="sm" 
              variant={editor.isActive('italic') ? 'default' : 'ghost'} 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="p-1 h-8 w-8"
            >
              <span className="italic">I</span>
            </Button>
            <Button 
              size="sm" 
              variant={editor.isActive('link') ? 'default' : 'ghost'} 
              onClick={() => {
                const url = window.prompt('URL');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className="p-1 h-8 w-8"
            >
              <span className="underline">L</span>
            </Button>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
}