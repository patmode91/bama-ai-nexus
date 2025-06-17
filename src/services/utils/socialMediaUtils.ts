/**
 * Cleans a social media handle by removing leading '@' symbols or full URLs,
 * aiming to extract the core username/identifier.
 * @param handleOrUrl The raw handle or URL string.
 * @param platformBaseUrls Optional array of base URLs for the platform (e.g., ['twitter.com/', 'x.com/'])
 * @returns The cleaned handle, or null if input is invalid or empty.
 */
function cleanSocialMediaHandle(handleOrUrl: string, platformBaseUrls: string[] = []): string | null {
  if (!handleOrUrl || typeof handleOrUrl !== 'string' || handleOrUrl.trim() === '') {
    return null;
  }

  let cleaned = handleOrUrl.trim();

  // Attempt to remove platform URLs if provided
  for (const baseUrl of platformBaseUrls) {
    const lowerBaseUrl = baseUrl.toLowerCase();
    if (cleaned.toLowerCase().includes(lowerBaseUrl)) {
      const parts = cleaned.split(new RegExp(lowerBaseUrl, 'i'));
      if (parts.length > 1) {
        cleaned = parts[1];
        // Further clean up query params or paths after handle
        cleaned = cleaned.split('/')[0].split('?')[0];
        break;
      }
    }
  }

  // Remove leading '@'
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1);
  }

  // Basic validation for typical handle characters (alphanumeric, underscore, sometimes hyphen)
  // This is a generic pattern; specific platforms might have stricter rules.
  if (/^[a-zA-Z0-9_.-]+$/.test(cleaned) && cleaned.length > 0) {
    return cleaned;
  }

  // If after cleaning it's not a valid-looking handle, return null
  // This handles cases where only the base URL was passed or invalid characters remain.
  if (cleaned === handleOrUrl.trim() && (platformBaseUrls.length > 0 || handleOrUrl.startsWith('@'))) {
      // If it's unchanged and it looked like something that should have been cleaned, it's probably not just a handle
      // Or if it's just a plain string that doesn't match handle pattern
      if (!/^[a-zA-Z0-9_.-]+$/.test(cleaned)) return null;
  }


  return cleaned.length > 0 ? cleaned : null;
}


/**
 * Generates a Facebook profile URL from a handle or page ID.
 * @param handleOrId The Facebook username, page ID, or full URL.
 * @returns The full Facebook profile URL or null if handle is invalid.
 */
export function generateFacebookURL(handleOrId: string): string | null {
  const cleanedHandle = cleanSocialMediaHandle(handleOrId, ['facebook.com/']);
  if (!cleanedHandle) return null;
  // Facebook URLs can be diverse (pages, profiles, groups). This is a common pattern for pages/profiles.
  return `https://www.facebook.com/${cleanedHandle}`;
}

/**
 * Generates a Twitter (X) profile URL from a handle.
 * @param handle The Twitter username or full URL.
 * @returns The full Twitter profile URL or null if handle is invalid.
 */
export function generateTwitterURL(handle: string): string | null {
  const cleanedHandle = cleanSocialMediaHandle(handle, ['twitter.com/', 'x.com/']);
  if (!cleanedHandle) return null;
  return `https://www.x.com/${cleanedHandle}`;
}

/**
 * Generates a LinkedIn company profile URL from a company vanity name or ID.
 * @param vanityNameOrId The LinkedIn company vanity name, ID, or full URL.
 * @returns The full LinkedIn company profile URL or null if input is invalid.
 */
export function generateLinkedInCompanyURL(vanityNameOrId: string): string | null {
  const cleanedPath = cleanSocialMediaHandle(vanityNameOrId, ['linkedin.com/company/']);
  if (!cleanedPath) return null;
  return `https://www.linkedin.com/company/${cleanedPath}`;
}

/**
 * Generates a LinkedIn personal profile URL from a vanity name or ID.
 * @param vanityNameOrId The LinkedIn personal vanity name (e.g., "john-doe-12345") or full URL.
 * @returns The full LinkedIn personal profile URL or null if input is invalid.
 */
export function generateLinkedInPersonURL(vanityNameOrId: string): string | null {
  const cleanedPath = cleanSocialMediaHandle(vanityNameOrId, ['linkedin.com/in/']);
  if (!cleanedPath) return null;
  return `https://www.linkedin.com/in/${cleanedPath}`;
}

/**
 * Generates an Instagram profile URL from a username.
 * @param username The Instagram username or full URL.
 * @returns The full Instagram profile URL or null if username is invalid.
 */
export function generateInstagramURL(username: string): string | null {
  const cleanedHandle = cleanSocialMediaHandle(username, ['instagram.com/']);
  if (!cleanedHandle) return null;
  return `https://www.instagram.com/${cleanedHandle}`;
}

/**
 * Generates a YouTube channel/user URL from a username or channel ID.
 * @param usernameOrId The YouTube username, custom URL handle (often starts with @), or channel ID (starts with UC).
 * @returns The full YouTube URL or null if input is invalid.
 */
export function generateYouTubeURL(usernameOrId: string): string | null {
  const cleanedPath = cleanSocialMediaHandle(usernameOrId, ['youtube.com/c/', 'youtube.com/user/', 'youtube.com/@', 'youtube.com/channel/']);
  if (!cleanedPath) return null;

  if (cleanedPath.startsWith('UC') && cleanedPath.length > 20) { // Common pattern for Channel IDs
    return `https://www.youtube.com/channel/${cleanedPath}`;
  }
  if (cleanedPath.startsWith('@')) {
     return `https://www.youtube.com/${cleanedPath}`;
  }
  // Fallback for older username or custom /c/ URLs, though @ handles are current
  return `https://www.youtube.com/@${cleanedPath}`; // Defaulting to @handle format
}
