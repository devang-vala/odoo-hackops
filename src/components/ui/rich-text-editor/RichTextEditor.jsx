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
import { getPublicIdFromUrl } from '@/lib/cloudinaryUtils';
import { Loader2, X } from 'lucide-react';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const imageInputRef = useRef(null);
  const editorContainerRef = useRef(null);
  const previousImagesRef = useRef([]);

  // Function to extract image URLs from HTML content
  const extractImageUrls = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');
    return Array.from(images).map(img => img.src);
  };

  // Function to delete an image from Cloudinary
  const deleteImageFromCloudinary = async (url) => {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return;
    
    try {
      setIsDeleting(true);
      // console.log('Deleting image from Cloudinary:', url);
      const response = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });
      
      if (!response.ok) {
        console.error('Failed to delete image from Cloudinary');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
      const newContent = editor.getHTML();
      
      // Extract image URLs from the new content
      const currentImages = extractImageUrls(newContent);
      const previousImages = previousImagesRef.current;
      
      // Find images that were in the previous content but not in the current one
      const removedImages = previousImages.filter(url => !currentImages.includes(url));
      
      // Delete removed images from Cloudinary
      removedImages.forEach(url => {
        if (url.includes('cloudinary.com')) {
          deleteImageFromCloudinary(url);
        }
      });
      
      // Update the previous images reference
      previousImagesRef.current = currentImages;
      
      // Call the parent onChange handler
      onChange(newContent);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  // Initialize previousImagesRef with the initial content
  useEffect(() => {
    if (editor) {
      const initialImages = extractImageUrls(editor.getHTML());
      previousImagesRef.current = initialImages;
    }
  }, [editor]);

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
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper relative inline-block';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Create the delete button with X icon
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'image-delete-btn';
        
        // Using an X icon from Lucide in SVG format
        deleteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        `;
        
        wrapper.appendChild(deleteBtn);

        // Handle delete button click
        deleteBtn.addEventListener('click', () => {
          if (!editor) return;
          
          // Find the position of the node in the document
          const pos = editor.view.posAtDOM(img, 0);
          if (typeof pos !== 'number') return;
          
          // Delete the node from the editor
          editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run();
          
          // Note: We don't need to call deleteImageFromCloudinary here
          // since the onUpdate handler will detect the removed image
        });
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
        {isDeleting && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-50">
            <div className="bg-white p-3 rounded-md shadow-md flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span>Removing Image...</span>
            </div>
          </div>
        )}
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
          margin: 0.5rem 0;
        }
        
        .image-wrapper img {
          max-width: 100%;
          height: auto;
        }
        
        .image-delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: #ef4444;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          z-index: 20;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .image-delete-btn:hover {
          background-color: #dc2626;
        }
        
        .image-delete-btn svg {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </div>
  );
}