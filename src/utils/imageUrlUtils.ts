/**
 * Utility functions for handling image URLs, including blob URL validation
 */

/**
 * Validates if a blob URL is still accessible
 * @param url - The URL to validate
 * @returns Promise<boolean> - true if the URL is valid and accessible
 */
export const validateBlobUrl = async (url: string): Promise<boolean> => {
  if (!url.startsWith('blob:')) {
    return true; // Non-blob URLs are assumed valid
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Blob URL validation failed:', url, error);
    return false;
  }
};

/**
 * Checks if a URL is a blob URL
 * @param url - The URL to check
 * @returns boolean - true if it's a blob URL
 */
export const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Sanitizes an image URL, removing invalid blob URLs
 * @param url - The URL to sanitize
 * @param fallbackUrl - Optional fallback URL to use if the original is invalid
 * @returns Promise<string | null> - The sanitized URL or null if invalid
 */
export const sanitizeImageUrl = async (
  url: string | null | undefined,
  fallbackUrl?: string
): Promise<string | null> => {
  if (!url) {
    return fallbackUrl || null;
  }

  // If it's not a blob URL, return as is
  if (!isBlobUrl(url)) {
    return url;
  }

  // Validate blob URL
  const isValid = await validateBlobUrl(url);
  if (isValid) {
    return url;
  }

  console.warn('Invalid blob URL detected and removed:', url);
  return fallbackUrl || null;
};

/**
 * Filters out invalid blob URLs from an array of URLs
 * @param urls - Array of URLs to filter
 * @returns Promise<string[]> - Filtered array with only valid URLs
 */
export const filterValidImageUrls = async (urls: string[]): Promise<string[]> => {
  const validationPromises = urls.map(async (url) => {
    const sanitized = await sanitizeImageUrl(url);
    return sanitized;
  });

  const results = await Promise.all(validationPromises);
  return results.filter((url): url is string => url !== null);
};

/**
 * Safe image URL getter that handles blob URL validation
 * @param url - The image URL
 * @param placeholderUrl - Optional placeholder URL for invalid images
 * @returns Promise<string> - A valid image URL or placeholder
 */
export const getSafeImageUrl = async (
  url: string | null | undefined,
  placeholderUrl: string = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600'
): Promise<string> => {
  const sanitized = await sanitizeImageUrl(url, placeholderUrl);
  return sanitized || placeholderUrl;
};
