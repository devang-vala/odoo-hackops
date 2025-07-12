"use client";

import { forwardRef } from 'react';

export const ImageUpload = forwardRef(
  function ImageUpload({ onImageUpload }, ref) {
    const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await onImageUpload(file);
        // Reset the input so the same file can be selected again
        e.target.value = '';
      }
    };

    return (
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    );
  }
);