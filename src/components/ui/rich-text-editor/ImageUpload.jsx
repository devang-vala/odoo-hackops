"use client";

import { forwardRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export const ImageUpload = forwardRef(
  function ImageUpload({ onImageUpload }, ref) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
        
        // Send the file to our API route
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const data = await response.json();
        
        // Pass the Cloudinary URL to the editor
        await onImageUpload(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
        // Reset the input so the same file can be selected again
        e.target.value = '';
      }
    };

    return (
      <div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    );
  }
);