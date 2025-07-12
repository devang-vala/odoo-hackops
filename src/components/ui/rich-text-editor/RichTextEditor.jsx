"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useRef, useEffect } from 'react';
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
  const editorContainerRef = useRef(null);

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
          class: 'rounded-md max-w-full h-auto editor-image',
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

  // Custom image handler that attaches delete buttons to images
  useEffect(() => {
    if (!editor || !editorContainerRef.current) return;

    // Add a mutation observer to detect when images are added to the editor
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            // Check if the added node contains images
            if (node.nodeType === Node.ELEMENT_NODE) {
              const images = node.querySelectorAll('img.editor-image');
              if (images.length) {
                addDeleteButtonsToImages(images);
              }
            }
          });
        }
      });
    });

    // Setup the observer
    const editorElement = editorContainerRef.current.querySelector('.ProseMirror');
    if (editorElement) {
      observer.observe(editorElement, {
        childList: true,
        subtree: true,
      });
    }

    // Add delete buttons to any existing images
    const existingImages = editorContainerRef.current.querySelectorAll('img.editor-image');
    if (existingImages.length) {
      addDeleteButtonsToImages(existingImages);
    }

    function addDeleteButtonsToImages(images) {
      images.forEach((img) => {
        // Check if the image already has a wrapper with a delete button
        if (img.parentNode.classList.contains('image-wrapper')) return;

        // Create a wrapper for the image
        const wrapper = document.createElement('span');
        wrapper.className = 'image-wrapper relative inline-block';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Create the delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'image-delete-btn absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity';
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        wrapper.appendChild(deleteBtn);

        // Handle delete button click
        deleteBtn.addEventListener('click', () => {
          if (!editor) return;
          
          // Find the position of the node in the document
          const pos = editor.view.posAtDOM(img, 0);
          if (typeof pos !== 'number') return;
          
          // Delete the node
          editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run();
        });

        // Make wrapper a hover group
        wrapper.classList.add('group');
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [editor]);

  const addEmoji = useCallback((emoji) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  }, [editor]);

  const handleImageUpload = useCallback(async (imageUrl) => {
    if (!editor) return;
    
    // If the imageUrl is already a string (from Cloudinary), use it directly
    if (typeof imageUrl === 'string') {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      return;
    }
    
    // Otherwise, it's a File object from direct selection
    const file = imageUrl;
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
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
      
      <div ref={editorContainerRef} className="relative">
        <EditorContent 
          editor={editor} 
          className={cn(
            "px-4 py-2 prose prose-sm sm:prose max-w-none overflow-y-auto",
            `max-h-[${maxHeight}] min-h-[${minHeight}]`
          )}
        />
      </div>
      
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

      <style jsx global>{`
        .image-wrapper {
          display: inline-block;
          position: relative;
        }
        
        .image-wrapper img {
          max-width: 100%;
          height: auto;
        }
        
        .image-wrapper:hover::after {
          content: "";
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 0.375rem;
          pointer-events: none;
        }
        
        .image-delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: rgba(239, 68, 68, 0.8);
          color: white;
          border-radius: 9999px;
          padding: 4px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
        }
        
        .image-wrapper:hover .image-delete-btn {
          opacity: 0.8;
        }
        
        .image-delete-btn:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}