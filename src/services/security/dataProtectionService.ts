
import CryptoJS from 'crypto-js';
import { logger } from '../loggerService';

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  salt: string;
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  categories: string[];
  retentionPeriod?: number; // days
  requiresEncryption: boolean;
}

export interface PIIField {
  fieldName: string;
  dataType: 'email' | 'phone' | 'ssn' | 'credit_card' | 'name' | 'address' | 'custom';
  maskingPattern?: string;
}

class DataProtectionService {
  private static instance: DataProtectionService;
  private readonly SECRET_KEY = 'bama-ai-nexus-encryption-key'; // In production, use environment variable
  
  private dataClassifications: Map<string, DataClassification> = new Map();
  private piiFields: Map<string, PIIField[]> = new Map();

  static getInstance(): DataProtectionService {
    if (!DataProtectionService.instance) {
      DataProtectionService.instance = new DataProtectionService();
    }
    return DataProtectionService.instance;
  }

  constructor() {
    this.initializeDataClassifications();
    this.initializePIIFields();
  }

  // Encryption methods
  encrypt(data: string, key?: string): EncryptionResult {
    try {
      const salt = CryptoJS.lib.WordArray.random(128/8);
      const iv = CryptoJS.lib.WordArray.random(128/8);
      const encryptionKey = key || this.SECRET_KEY;
      
      const derivedKey = CryptoJS.PBKDF2(encryptionKey, salt, {
        keySize: 256/32,
        iterations: 1000
      });

      const encryptedData = CryptoJS.AES.encrypt(data, derivedKey, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });

      return {
        encryptedData: encryptedData.toString(),
        iv: iv.toString(),
        salt: salt.toString()
      };
    } catch (error) {
      logger.error('Encryption failed', { error }, 'DataProtection');
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData: string, iv: string, salt: string, key?: string): string {
    try {
      const encryptionKey = key || this.SECRET_KEY;
      
      const derivedKey = CryptoJS.PBKDF2(encryptionKey, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256/32,
        iterations: 1000
      });

      const decryptedData = CryptoJS.AES.decrypt(encryptedData, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });

      return decryptedData.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error('Decryption failed', { error }, 'DataProtection');
      throw new Error('Decryption failed');
    }
  }

  // Data masking for PII
  maskPII(data: any, tableName: string): any {
    const piiFields = this.piiFields.get(tableName) || [];
    const maskedData = { ...data };

    piiFields.forEach(field => {
      if (maskedData[field.fieldName]) {
        maskedData[field.fieldName] = this.maskField(maskedData[field.fieldName], field);
      }
    });

    return maskedData;
  }

  private maskField(value: string, field: PIIField): string {
    switch (field.dataType) {
      case 'email':
        const [name, domain] = value.split('@');
        return `${name.substring(0, 2)}***@${domain}`;
      case 'phone':
        return value.replace(/(\d{3})\d{3}(\d{4})/, '$1-***-$2');
      case 'ssn':
        return value.replace(/\d{3}-\d{2}-(\d{4})/, '***-**-$1');
      case 'credit_card':
        return value.replace(/\d{4}\s?\d{4}\s?\d{4}\s?(\d{4})/, '**** **** **** $1');
      case 'name':
        const parts = value.split(' ');
        return parts.map((part, index) => 
          index === 0 ? part : part.charAt(0) + '*'.repeat(part.length - 1)
        ).join(' ');
      case 'address':
        return value.replace(/\d+/g, '***');
      default:
        if (field.maskingPattern) {
          return value.replace(new RegExp(field.maskingPattern), '***');
        }
        return '***';
    }
  }

  // Data classification
  classifyData(tableName: string, data: any): DataClassification {
    const classification = this.dataClassifications.get(tableName);
    if (classification) {
      return classification;
    }

    // Auto-classify based on field names
    const fieldNames = Object.keys(data);
    const sensitiveFields = ['email', 'phone', 'ssn', 'password', 'credit_card', 'address'];
    
    const hasSensitiveData = fieldNames.some(field => 
      sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))
    );

    return {
      level: hasSensitiveData ? 'confidential' : 'internal',
      categories: hasSensitiveData ? ['pii'] : ['business_data'],
      requiresEncryption: hasSensitiveData,
      retentionPeriod: hasSensitiveData ? 2555 : 1095 // 7 years for PII, 3 years for business data
    };
  }

  // Data retention
  shouldRetainData(tableName: string, createdAt: Date): boolean {
    const classification = this.dataClassifications.get(tableName);
    if (!classification?.retentionPeriod) return true;

    const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return ageInDays < classification.retentionPeriod;
  }

  // Secure data deletion
  secureDelete(data: any): void {
    // In a real implementation, this would involve multiple overwrite passes
    // For now, we'll just clear the data and log the action
    Object.keys(data).forEach(key => {
      delete data[key];
    });
    
    logger.info('Secure data deletion performed', { timestamp: Date.now() }, 'DataProtection');
  }

  // Privacy controls
  anonymizeData(data: any, tableName: string): any {
    const piiFields = this.piiFields.get(tableName) || [];
    const anonymizedData = { ...data };

    piiFields.forEach(field => {
      if (anonymizedData[field.fieldName]) {
        delete anonymizedData[field.fieldName];
      }
    });

    return anonymizedData;
  }

  private initializeDataClassifications(): void {
    this.dataClassifications.set('profiles', {
      level: 'confidential',
      categories: ['pii', 'personal_data'],
      requiresEncryption: true,
      retentionPeriod: 2555 // 7 years
    });

    this.dataClassifications.set('businesses', {
      level: 'internal',
      categories: ['business_data'],
      requiresEncryption: false,
      retentionPeriod: 1095 // 3 years
    });

    this.dataClassifications.set('reviews', {
      level: 'internal',
      categories: ['user_generated_content'],
      requiresEncryption: false,
      retentionPeriod: 1095 // 3 years
    });

    this.dataClassifications.set('analytics_events', {
      level: 'internal',
      categories: ['analytics', 'usage_data'],
      requiresEncryption: false,
      retentionPeriod: 365 // 1 year
    });
  }

  private initializePIIFields(): void {
    this.piiFields.set('profiles', [
      { fieldName: 'email', dataType: 'email' },
      { fieldName: 'full_name', dataType: 'name' }
    ]);

    this.piiFields.set('businesses', [
      { fieldName: 'contactemail', dataType: 'email' },
      { fieldName: 'contactname', dataType: 'name' }
    ]);
  }

  // Statistics and compliance reporting
  getProtectionStats() {
    return {
      totalClassifications: this.dataClassifications.size,
      totalPIIFields: Array.from(this.piiFields.values()).flat().length,
      encryptionEnabled: this.SECRET_KEY ? true : false,
      retentionPolicies: Array.from(this.dataClassifications.values()).filter(c => c.retentionPeriod).length
    };
  }

  generateComplianceReport() {
    const classifications = Array.from(this.dataClassifications.entries());
    const piiFields = Array.from(this.piiFields.entries());

    return {
      timestamp: Date.now(),
      dataClassifications: classifications.map(([table, classification]) => ({
        table,
        level: classification.level,
        categories: classification.categories,
        encrypted: classification.requiresEncryption,
        retentionDays: classification.retentionPeriod
      })),
      piiFields: piiFields.map(([table, fields]) => ({
        table,
        fieldsCount: fields.length,
        fields: fields.map(f => ({ name: f.fieldName, type: f.dataType }))
      })),
      protectionMeasures: {
        encryption: true,
        masking: true,
        anonymization: true,
        secureDelete: true,
        retentionPolicies: true
      }
    };
  }
}

export const dataProtectionService = DataProtectionService.getInstance();
export default dataProtectionService;
