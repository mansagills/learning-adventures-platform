import { validateIdentifier } from '../../lib/security';
import { describe, it, expect } from 'vitest';

describe('Security Utilities', () => {
  describe('validateIdentifier', () => {
    it('should accept valid identifiers', () => {
      expect(() => validateIdentifier('valid-id')).not.toThrow();
      expect(() => validateIdentifier('valid_id')).not.toThrow();
      expect(() => validateIdentifier('12345')).not.toThrow();
      expect(() => validateIdentifier('valid-id-123')).not.toThrow();
    });

    it('should reject path traversal attempts', () => {
      expect(() => validateIdentifier('../evil')).toThrow();
      expect(() => validateIdentifier('..\\evil')).toThrow(); // Backslash
      expect(() => validateIdentifier('/evil')).toThrow();
      expect(() => validateIdentifier('evil/')).toThrow();
      expect(() => validateIdentifier('....//evil')).toThrow();
    });

    it('should reject invalid characters', () => {
      expect(() => validateIdentifier('invalid space')).toThrow();
      expect(() => validateIdentifier('invalid$char')).toThrow();
      expect(() => validateIdentifier('invalid.char')).toThrow(); // Dot is not allowed
    });

    it('should reject empty identifiers', () => {
      expect(() => validateIdentifier('')).toThrow();
    });
  });
});
