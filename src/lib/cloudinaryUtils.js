/**
 * Extracts the Cloudinary public ID from a Cloudinary URL
 * 
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public ID or null if not a valid Cloudinary URL
 */
export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Parse the URL
    const urlObj = new URL(url);
    
    // Check if it's a Cloudinary URL
    if (!urlObj.hostname.includes('cloudinary.com')) return null;
    
    // Extract the path
    const pathParts = urlObj.pathname.split('/');
    
    // The format is typically: /[cloud_name]/image/upload/[optional_transformations]/[public_id].[extension]
    // We need to find the index of 'upload' and get everything after that (excluding the extension)
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get all parts after 'upload', join them, and remove the extension
    const publicIdWithExtension = pathParts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}