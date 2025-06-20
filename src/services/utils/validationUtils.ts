
/**
 * Utility functions for data validation
 */

/**
 * Validates if a string is a valid URL
 * @param url The URL string to validate
 * @returns True if the URL is valid, false otherwise
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates if an email address is valid
 * @param email The email string to validate
 * @returns True if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a phone number is valid (basic US format)
 * @param phone The phone number string to validate
 * @returns True if the phone number is valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const phoneRegex = /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Alias for isValidPhone to match expected import
 */
export const isValidPhoneNumber = isValidPhone;

/**
 * Validates if a value is not empty
 * @param value The value to check
 * @returns True if the value is not empty, false otherwise
 */
export function isNotEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  return true;
}

/**
 * Validates if a string is within a specified length range
 * @param value The string to validate
 * @param min Minimum length
 * @param max Maximum length
 * @returns True if the string length is within range, false otherwise
 */
export function isWithinLength(value: string, min: number, max: number): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validates if a ZIP code is valid US format
 * @param zipCode The ZIP code to validate
 * @returns True if the ZIP code is valid, false otherwise
 */
export function isValidUSZipCode(zipCode: string): boolean {
  if (!zipCode || typeof zipCode !== 'string') {
    return false;
  }
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode.trim());
}

/**
 * Validates if a number is positive
 * @param value The value to check
 * @returns True if the number is positive, false otherwise
 */
export function isPositiveNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validates if a number is non-negative
 * @param value The value to check
 * @returns True if the number is non-negative, false otherwise
 */
export function isNonNegativeNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Validates if a value is within a specified range
 * @param value The value to check
 * @param min Minimum value
 * @param max Maximum value
 * @returns True if the value is within range, false otherwise
 */
export function isValueInRange(value: any, min: number, max: number): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validates if a category is valid
 * @param category The category to validate
 * @returns True if the category is valid, false otherwise
 */
export function isValidCategory(category: string): boolean {
  return isNotEmpty(category) && typeof category === 'string';
}
