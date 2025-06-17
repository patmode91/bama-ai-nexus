import {
  isValidEmail,
  isValidPhoneNumber,
  isValidURL,
  isNotEmpty,
  isWithinLength,
  isValidUSZipCode,
  isPositiveNumber,
  isNonNegativeNumber,
  isValueInRange,
  isValidCategory
} from '../../utils/validationUtils';

// Define a basic Business type for defining validation rules.
// In a real application, this would likely be imported from a shared types definition.
// Ensure this aligns with the Business type used in MCPAgentCurator.ts
export interface BusinessForValidation {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  category?: string; // e.g., 'Restaurant', 'Technology', 'Retail'
  description?: string;
  yearFounded?: number;
  employeeCount?: number;
  // Add other fields that need validation
}

export interface ValidationIssue {
  field: string; // Can be a dot-separated path for nested fields, e.g., 'address.zipCode'
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationRule {
  field: keyof BusinessForValidation | string; // Allow string for nested paths
  // Validator function: takes the value of the field and optionally the whole business object
  validator: (value: any, business?: BusinessForValidation) => boolean;
  message: string;
  severity?: 'error' | 'warning';
  // Optional function to determine if this rule should be applied to the business
  appliesTo?: (business: BusinessForValidation) => boolean;
  // Optional flag to indicate if the field is required. If true and isNotEmpty fails, it's an error.
  required?: boolean;
}

export const businessValidationRules: ValidationRule[] = [
  // Name
  {
    field: 'name',
    validator: (val) => isNotEmpty(val) && isWithinLength(val, 2, 100),
    message: 'Business name is required and must be between 2 and 100 characters.',
    severity: 'error',
    required: true,
  },
  // Email
  {
    field: 'email',
    validator: isValidEmail,
    message: 'Invalid email format.',
    severity: 'error',
    appliesTo: (business) => isNotEmpty(business.email), // Only validate if email is provided
  },
  // Phone
  {
    field: 'phone',
    validator: isValidPhoneNumber,
    message: 'Invalid phone number format. Expected North American format.',
    severity: 'warning',
    appliesTo: (business) => isNotEmpty(business.phone),
  },
  // Website
  {
    field: 'website',
    validator: isValidURL,
    message: 'Invalid website URL. Must include http:// or https://.',
    severity: 'error',
    appliesTo: (business) => isNotEmpty(business.website),
  },
  // Description
  {
    field: 'description',
    validator: (val) => isWithinLength(val, 10, 5000),
    message: 'Description must be between 10 and 5000 characters.',
    severity: 'warning',
    appliesTo: (business) => isNotEmpty(business.description),
  },
  // Category
  {
    field: 'category',
    validator: (val) => isNotEmpty(val) && isValidCategory(val), // isValidCategory from utils checks for non-empty string for now
    message: 'Category is required and must be a valid category name.',
    severity: 'error',
    required: true,
  },
  // Year Founded
  {
    field: 'yearFounded',
    validator: (val) => isValueInRange(val, 1800, new Date().getFullYear()),
    message: `Year founded must be a valid year between 1800 and ${new Date().getFullYear()}.`,
    severity: 'error',
    appliesTo: (business) => business.yearFounded !== undefined && business.yearFounded !== null,
  },
  // Employee Count
  {
    field: 'employeeCount',
    validator: isNonNegativeNumber,
    message: 'Employee count must be a non-negative number.',
    severity: 'error',
    appliesTo: (business) => business.employeeCount !== undefined && business.employeeCount !== null,
  },

  // Address fields (example for zipCode, others would be similar)
  {
    field: 'address.street', // Using dot notation for nested field
    validator: (val, business) => isNotEmpty(business?.address?.street),
    message: 'Street address is required if an address is partially provided.',
    severity: 'error',
    appliesTo: (business) => typeof business.address === 'object' && isNotEmpty(business.address) && !isNotEmpty(business.address.street),
    required: false, // The street itself is required *if* address object is present and street is missing
  },
  {
    field: 'address.city',
    validator: (val, business) => isNotEmpty(business?.address?.city),
    message: 'City is required if an address is partially provided.',
    severity: 'error',
    appliesTo: (business) => typeof business.address === 'object' && isNotEmpty(business.address) && !isNotEmpty(business.address.city),
    required: false,
  },
  {
    field: 'address.state',
    validator: (val, business) => isNotEmpty(business?.address?.state) && isWithinLength(business?.address?.state || '', 2, 50), // e.g. "CA" or "California"
    message: 'State is required and must be valid if an address is partially provided.',
    severity: 'error',
    appliesTo: (business) => typeof business.address === 'object' && isNotEmpty(business.address) && !isNotEmpty(business.address.state),
    required: false,
  },
  {
    field: 'address.zipCode',
    validator: (val, business) => isValidUSZipCode(business?.address?.zipCode || ''),
    message: 'Invalid U.S. ZIP code format.',
    severity: 'error',
    appliesTo: (business) => typeof business.address === 'object' && isNotEmpty(business.address?.zipCode),
  },
  {
    field: 'address.country',
    validator: (val, business) => isNotEmpty(business?.address?.country),
    message: 'Country is required if an address is partially provided.',
    severity: 'error',
    appliesTo: (business) => typeof business.address === 'object' && isNotEmpty(business.address) && !isNotEmpty(business.address.country),
    required: false,
  },
];
