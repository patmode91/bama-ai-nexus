
import { MCPContext } from '../MCPContextManager';
import type { EnrichedBusinessData, DataQualityReport } from './types';
import {
  businessValidationRules,
  type BusinessForValidation,
  type ValidationIssue,
  type ValidationRule
} from './curationRules';
import { isNotEmpty } from '../../utils/validationUtils'; // Import isNotEmpty for required check

// Helper function to retrieve a value from a potentially nested object using a dot-separated path
function getValueFromPath(object: any, path: string): any {
  if (!path) return undefined;
  return path.split('.').reduce((currentObject, key) => {
    return currentObject && currentObject[key] !== undefined ? currentObject[key] : undefined;
  }, object);
}

export class DataQualityAnalyzer {
  /**
   * Validates a business profile against a predefined set of rules.
   * @param business The business data to validate.
   * @returns An object containing the validation status (isValid) and a list of identified issues.
   */
  validateBusinessProfile(business: BusinessForValidation): { isValid: boolean; issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = [];

    for (const rule of businessValidationRules) {
      const fieldValue = getValueFromPath(business, rule.field as string);

      // Check applicability of the rule
      if (rule.appliesTo && !rule.appliesTo(business)) {
        continue;
      }

      // Handle 'required' fields
      if (rule.required) {
        if (!isNotEmpty(fieldValue)) {
          issues.push({
            field: rule.field as string,
            message: rule.message, // Or a more generic "Field is required."
            severity: 'error',
          });
          continue; // If required and empty, skip other validators for this field
        }
      }

      // If the field is not empty or not required, then apply the specific validator
      // However, if it's not required AND it's empty, the validator should not run unless it's specifically designed to handle empty optional fields.
      // Most validators (isValidEmail, isValidURL) implicitly fail or should fail for empty strings if not guarded.
      // The `appliesTo` or explicit checks within validators usually handle optional fields.
      // If a field is optional (not rule.required) and empty, its specific validator (e.g. isValidEmail) should not run.
      // The current `appliesTo` in rules like email handles this (e.g. `appliesTo: (business) => isNotEmpty(business.email)`).
      // If a field is present (isNotEmpty(fieldValue) is true), then run the validator.
      // If a field is optional and not present, it's valid unless `required` is true.

      if (isNotEmpty(fieldValue)) { // Only run specific validator if field has a value
        if (!rule.validator(fieldValue, business)) {
          issues.push({
            field: rule.field as string,
            message: rule.message,
            severity: rule.severity || 'error',
          });
        }
      }
    }

    const isValid = !issues.some(issue => issue.severity === 'error');
    return { isValid, issues };
  }

  generateDataQualityReport(enrichedBusinesses: EnrichedBusinessData[]): DataQualityReport {
    const totalProcessed = enrichedBusinesses.length;
    const highQuality = enrichedBusinesses.filter(b => b.dataQuality === 'high').length;
    const needsImprovement = enrichedBusinesses.filter(b => b.dataQuality === 'low').length;

    return {
      totalProcessed,
      highQuality,
      needsImprovement
    };
  }

  generateDataSuggestions(enrichedBusinesses: EnrichedBusinessData[], context: MCPContext): string[] {
    const suggestions: string[] = [];

    const lowQualityCount = enrichedBusinesses.filter(b => b.dataQuality === 'low').length;
    if (lowQualityCount > 0) {
      suggestions.push(`${lowQualityCount} businesses could benefit from enhanced profile data`);
    }

    const unverifiedCount = enrichedBusinesses.filter(b => !b.business.verified).length;
    if (unverifiedCount > 0) {
      suggestions.push(`${unverifiedCount} businesses are pending verification`);
    }

    const highCompatibility = enrichedBusinesses.filter(b => b.compatibilityScore > 80).length;
    if (highCompatibility > 0) {
      suggestions.push(`${highCompatibility} businesses show high compatibility with your requirements`);
    }

    return suggestions;
  }
}
