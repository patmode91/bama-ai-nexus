/**
 * Checks if a value is not null, undefined, or an empty string/array.
 * For objects, it checks if it has any own properties.
 * @param value The value to check.
 * @returns True if the value is considered not empty, false otherwise.
 */
export function isNotEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0 && !(value instanceof Date)) {
    return false;
  }
  return true;
}

/**
 * Validates a basic email format.
 * @param email The email string to validate.
 * @returns True if the email has a plausible format, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // Basic regex for email validation: something@something.something
  // This is not exhaustive but catches common errors.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a basic North American phone number format.
 * Allows for digits, hyphens, parentheses, spaces, and an optional leading '+1'.
 * Checks for 10 digits after normalization.
 * @param phone The phone number string to validate.
 * @returns True if the phone number is valid, false otherwise.
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  // Remove common formatting characters and optional +1 country code
  const normalizedPhone = phone.replace(/^\+1[\s-]*/, '').replace(/[\s-().]/g, '');
  // Check if it contains exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(normalizedPhone);
}

/**
 * Validates if a string is a plausible URL (http, https).
 * @param url The URL string to validate.
 * @returns True if the URL is valid, false otherwise.
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Checks if the length of a string or an array is within a specified range.
 * @param value The string or array to check.
 * @param min Minimum length (inclusive).
 * @param max Maximum length (inclusive).
 * @returns True if the length is within the range, false otherwise.
 */
export function isWithinLength(value: string | any[], min: number, max: number): boolean {
  if (value === null || value === undefined) {
    return false; // Or true if empty allowed and min is 0, depends on strictness
  }
  const length = typeof value === 'string' ? value.trim().length : value.length;
  return length >= min && length <= max;
}

/**
 * Validates a U.S. ZIP code format (5 digits or ZIP+4: 5 digits-4 digits).
 * @param zip The ZIP code string to validate.
 * @returns True if the ZIP code format is valid, false otherwise.
 */
export function isValidUSZipCode(zip: string): boolean {
  if (!zip || typeof zip !== 'string') {
    return false;
  }
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Checks if a value is a positive number (greater than 0).
 * @param value The value to check.
 * @returns True if the value is a positive number, false otherwise.
 */
export function isPositiveNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Checks if a value is a non-negative number (greater than or equal to 0).
 * @param value The value to check.
 * @returns True if the value is a non-negative number, false otherwise.
 */
export function isNonNegativeNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Checks if a value is within a given numerical range (inclusive).
 * @param value The number to check.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns True if the value is within the range, false otherwise.
 */
export function isValueInRange(value: number, min: number, max: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

// Example of a more specific validator: isValidCategory
// This would typically involve checking against a predefined list of valid categories.
// For this example, we'll just check if it's a non-empty string.
/**
 * Validates if a category is a non-empty string.
 * In a real app, this might check against a predefined list of categories.
 * @param category The category string.
 * @returns True if the category is a non-empty string.
 */
export function isValidCategory(category: string): boolean {
  return typeof category === 'string' && category.trim() !== '';
}
