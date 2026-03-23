import { describe, it, expect, vi } from 'vitest';
import { LoginSchema, validateLogin } from '@/utils/validation';
import { UserVersion } from '@/types';

describe('Login Validation - Zod/Pydantic Double-end Validation', () => {
  // Zod schema validation tests
  describe('Zod Schema Validation', () => {
    it('should validate valid username and version', () => {
      const validData = {
        username: '测试用户',
        version: 'BASIC',
      };

      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject username with less than 2 characters', () => {
      const invalidData = {
        username: 'A',
        version: 'BASIC',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('至少需要2个字符');
      }
    });

    it('should reject username with more than 20 characters', () => {
      const invalidData = {
        username: '这个用户名实在是太长了超过二十个字符了哦确实很长',
        version: 'BASIC',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('不能超过20个字符');
      }
    });

    it('should reject username with invalid characters', () => {
      const invalidData = {
        username: '测试@用户',
        version: 'BASIC',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('只能包含中文、字母、数字和下划线');
      }
    });

    it('should reject invalid version', () => {
      const invalidData = {
        username: '测试用户',
        version: 'INVALID',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate all valid versions', () => {
      const versions = ['BASIC', 'PRO', 'ENTERPRISE'];
      
      versions.forEach((version) => {
        const validData = {
          username: '测试用户',
          version,
        };

        const result = LoginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  // Pydantic-like backend simulation validation
  describe('Pydantic-like Backend Validation', () => {
    it('should return success for valid data', () => {
      const validData = {
        username: '测试用户',
        version: 'PRO',
      };

      const result = validateLogin(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeNull();
    });

    it('should return structured errors for invalid data', () => {
      const invalidData = {
        username: 'A',
        version: 'INVALID',
      };

      const result = validateLogin(invalidData);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should handle multiple validation errors', () => {
      const invalidData = {
        username: 'A@',
        version: 'INVALID',
      };

      const result = validateLogin(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeInstanceOf(Array);
    });

    it('should return field-specific error messages', () => {
      const invalidData = {
        username: 'A',
        version: 'BASIC',
      };

      const result = validateLogin(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors?.[0].field).toBe('username');
      expect(result.errors?.[0].message).toContain('至少需要2个字符');
    });
  });

  // Double-end validation consistency check
  describe('Double-end Validation Consistency', () => {
    it('should produce consistent results between Zod and Pydantic-like validation', () => {
      const testCases = [
        {
          data: { username: '有效用户', version: 'ENTERPRISE' },
          shouldPass: true,
        },
        {
          data: { username: 'A', version: 'BASIC' },
          shouldPass: false,
        },
        {
          data: { username: '无效@用户', version: 'PRO' },
          shouldPass: false,
        },
        {
          data: { username: '测试', version: 'INVALID' },
          shouldPass: false,
        },
      ];

      testCases.forEach(({ data, shouldPass }) => {
        const zodResult = LoginSchema.safeParse(data);
        const pydanticResult = validateLogin(data);

        expect(zodResult.success).toBe(shouldPass);
        expect(pydanticResult.success).toBe(shouldPass);
      });
    });
  });

  // Integration with UserVersion enum
  describe('UserVersion Enum Integration', () => {
    it('should validate against UserVersion enum values', () => {
      const enumValues = Object.values(UserVersion);
      
      enumValues.forEach((version) => {
        const validData = {
          username: '测试用户',
          version: version.toString(),
        };

        const result = LoginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });
});
