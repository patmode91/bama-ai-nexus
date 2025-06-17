/**
 * Utility functions for generating social media URLs from handles/usernames.
 */

/**
 * Generates a Facebook page/profile URL from a handle.
 * @param handle The Facebook handle/username (without @)
 * @returns The full Facebook URL
 */
export function generateFacebookURL(handle: string): string {
  // Remove @ if present and clean the handle
  const cleanHandle = handle.replace(/^@/, '').trim();
  return `https://www.facebook.com/${cleanHandle}`;
}

/**
 * Generates a Twitter profile URL from a handle.
 * @param handle The Twitter handle/username (with or without @)
 * @returns The full Twitter URL
 */
export function generateTwitterURL(handle: string): string {
  // Remove @ if present and clean the handle
  const cleanHandle = handle.replace(/^@/, '').trim();
  return `https://twitter.com/${cleanHandle}`;
}

/**
 * Generates a LinkedIn company page URL from a company handle/vanity name.
 * @param handle The LinkedIn company handle/vanity name
 * @returns The full LinkedIn company URL
 */
export function generateLinkedInCompanyURL(handle: string): string {
  // Remove @ if present and clean the handle
  const cleanHandle = handle.replace(/^@/, '').trim();
  return `https://www.linkedin.com/company/${cleanHandle}`;
}

/**
 * Generates an Instagram profile URL from a handle.
 * @param handle The Instagram handle/username (with or without @)
 * @returns The full Instagram URL
 */
export function generateInstagramURL(handle: string): string {
  // Remove @ if present and clean the handle
  const cleanHandle = handle.replace(/^@/, '').trim();
  return `https://www.instagram.com/${cleanHandle}`;
}

/**
 * Generates a YouTube channel URL from a handle/channel name.
 * @param handle The YouTube handle/channel name (with or without @)
 * @returns The full YouTube URL
 */
export function generateYouTubeURL(handle: string): string {
  // Remove @ if present and clean the handle
  const cleanHandle = handle.replace(/^@/, '').trim();
  
  // Check if it looks like a channel ID (starts with UC)
  if (cleanHandle.startsWith('UC')) {
    return `https://www.youtube.com/channel/${cleanHandle}`;
  }
  
  // Otherwise, treat as a custom handle
  return `https://www.youtube.com/@${cleanHandle}`;
}
