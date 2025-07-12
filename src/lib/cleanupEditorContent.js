import { getPublicIdFromUrl } from './cloudinaryUtils';

/**
 * Extracts all Cloudinary image URLs from HTML content
 * 
 * @param {string} html - The HTML content
 * @returns {string[]} - Array of Cloudinary image URLs
 */
export function extractCloudinaryUrls(html) {
  if (!html) return [];
  
  const urls = [];
  const regex = /<img[^>]+src="(https:\/\/res\.cloudinary\.com\/[^"]+)"[^>]*>/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

/**
 * Deletes all Cloudinary images in the HTML content
 * 
 * @param {string} html - The HTML content
 * @returns {Promise<void>}
 */
export async function deleteCloudinaryImagesFromContent(html) {
  const imageUrls = extractCloudinaryUrls(html);
  
  for (const url of imageUrls) {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) continue;
    
    try {
      await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }
}

/**
 * Compares old and new HTML content and deletes Cloudinary images that were removed
 * 
 * @param {string} oldHtml - The old HTML content
 * @param {string} newHtml - The new HTML content
 * @returns {Promise<void>}
 */
export async function cleanupRemovedImages(oldHtml, newHtml) {
  const oldUrls = extractCloudinaryUrls(oldHtml);
  const newUrls = extractCloudinaryUrls(newHtml);
  
  // Find URLs that are in oldUrls but not in newUrls
  const removedUrls = oldUrls.filter(url => !newUrls.includes(url));
  
  for (const url of removedUrls) {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) continue;
    
    try {
      await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });
    } catch (error) {
      console.error('Failed to delete removed image:', error);
    }
  }
}