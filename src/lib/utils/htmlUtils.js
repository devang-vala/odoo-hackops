import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Clean HTML
 */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || '');
}

/**
 * Extract text content from HTML
 * @param {string} html - The HTML string
 * @returns {string} - Plain text content
 */
export function extractTextFromHtml(html) {
  if (!html) return '';
  
  // Server-side compatible approach
  if (typeof window === 'undefined') {
    const tempDiv = new DOMPurify.sanitize.DOMPurifyI().createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  // Client-side approach
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Create a snippet of text from HTML content
 * @param {string} html - The HTML string
 * @param {number} maxLength - Maximum length of the snippet
 * @returns {string} - Plain text snippet
 */
export function createHtmlSnippet(html, maxLength = 100) {
  const text = extractTextFromHtml(html);
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;
}

/**
 * Extract the first image from HTML content
 * @param {string} html - The HTML string
 * @returns {string|null} - URL of the first image or null
 */
export function extractFirstImage(html) {
  if (!html) return null;
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const img = tempDiv.querySelector('img');
    return img ? img.src : null;
  } catch (e) {
    return null;
  }
}