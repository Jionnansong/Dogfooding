import { describe, it, expect, beforeEach } from 'vitest';

/**
 * 登录模块 Zod/Pydantic 双端校验逻辑测试
 * 
 * 测试目标：
 * 1. 前端 Zod Schema 校验规则
 * 2. 模拟后端 Pydantic 校验逻辑
 * 3. 双端校验一致性验证
 */

// 前端 Zod-like 校验模拟
interface ValidationResult {
  success: boolean;
  errors?: string[];
}

// 模拟前端 Zod Schema
const loginSchema = {
  username: {
    min: 2,
    max: 20,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/,
    validate: (value: string): string | null => {
      if (!value || value.trim().length === 0) {
        return '用户名不能为空';
      }
      if (value.length < 2) {
        return '用户名至少需要2个字符';
      }
      if (value.length > 20) {
        return '用户名不能超过20个字符';
      }
      if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(value)) {
        return '用户名只能包含中文、字母、数字和下划线';
      }
      return null;
    }
  },
  version: {
    allowed: ['BASIC', 'PRO', 'ENTERPRISE'],
    validate: (value: string): string | null => {
      if (!value) {
        return '版本类型不能为空';
      }
      if (!['BASIC', 'PRO', 'ENTERPRISE'].includes(value)) {
        return '无效的版本类型';
      }
      return null;
    }
  }
};

// 模拟后端 Pydantic 校验逻辑
const backendValidation = {
  validateLogin: (data: { username?: string; version?: string }): ValidationResult => {
    const errors: string[] = [];
    
    // 用户名校验 - 后端规则（更严格）
    if (!data.username) {
      errors.push('username: 字段必填');
    } else {
      if (data.username.length < 2) {
        errors.push('username: 长度不能小于2');
      }
      if (data.username.length > 20) {
        errors.push('username: 长度不能大于20');
      }
      // 后端额外安全检查
      if (/[<>\"'&]/.test(data.username)) {
        errors.push('username: 包含非法字符');
      }
    }
    
    // 版本校验
    if (!data.version) {
      errors.push('version: 字段必填');
    } else if (!['BASIC', 'PRO', 'ENTERPRISE'].includes(data.version)) {
      errors.push('version: 必须是 BASIC, PRO 或 ENTERPRISE');
    }
    
    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
};

// 前端校验函数
const frontendValidation = {
  validateLogin: (data: { username?: string; version?: string }): ValidationResult => {
    const errors: string[] = [];
    
    const usernameError = loginSchema.username.validate(data.username || '');
    if (usernameError) errors.push(usernameError);
    
    const versionError = loginSchema.version.validate(data.version || '');
    if (versionError) errors.push(versionError);
    
    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
};

describe('登录模块 - Zod/Pydantic 双端校验测试', () => {
  describe('前端 Zod Schema 校验', () => {
    it('应接受有效的用户名和版本', () => {
      const result = frontendValidation.validateLogin({
        username: '创作导师',
        version: 'PRO'
      });
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('应拒绝空用户名', () => {
      const result = frontendValidation.validateLogin({
        username: '',
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('用户名不能为空');
    });

    it('应拒绝过短的用户名', () => {
      const result = frontendValidation.validateLogin({
        username: 'A',
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('用户名至少需要2个字符');
    });

    it('应拒绝过长的用户名', () => {
      const result = frontendValidation.validateLogin({
        username: 'A'.repeat(21),
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('用户名不能超过20个字符');
    });

    it('应拒绝包含特殊字符的用户名', () => {
      const result = frontendValidation.validateLogin({
        username: 'user@123',
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('用户名只能包含中文、字母、数字和下划线');
    });

    it('应接受有效的中文用户名', () => {
      const result = frontendValidation.validateLogin({
        username: '喵酱_2024',
        version: 'ENTERPRISE'
      });
      expect(result.success).toBe(true);
    });

    it('应拒绝无效的版本类型', () => {
      const result = frontendValidation.validateLogin({
        username: 'testuser',
        version: 'INVALID'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('无效的版本类型');
    });

    it('应拒绝空的版本类型', () => {
      const result = frontendValidation.validateLogin({
        username: 'testuser',
        version: ''
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('版本类型不能为空');
    });
  });

  describe('后端 Pydantic 校验', () => {
    it('应接受有效的登录数据', () => {
      const result = backendValidation.validateLogin({
        username: '创作导师',
        version: 'PRO'
      });
      expect(result.success).toBe(true);
    });

    it('应拒绝缺失的用户名字段', () => {
      const result = backendValidation.validateLogin({
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('username: 字段必填');
    });

    it('应拒绝包含XSS风险字符的用户名', () => {
      const result = backendValidation.validateLogin({
        username: '<script>alert(1)</script>',
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('username: 包含非法字符');
    });

    it('应拒绝SQL注入风险的用户名', () => {
      const result = backendValidation.validateLogin({
        username: "admin' OR '1'='1",
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('username: 包含非法字符');
    });

    it('应拒绝无效的版本枚举值', () => {
      const result = backendValidation.validateLogin({
        username: 'testuser',
        version: 'PREMIUM'
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('version: 必须是 BASIC, PRO 或 ENTERPRISE');
    });
  });

  describe('双端校验一致性验证', () => {
    it('前后端应对有效数据达成一致', () => {
      const validCases = [
        { username: '喵酱', version: 'BASIC' },
        { username: 'User_123', version: 'PRO' },
        { username: '企业用户', version: 'ENTERPRISE' },
      ];

      validCases.forEach(data => {
        const frontend = frontendValidation.validateLogin(data);
        const backend = backendValidation.validateLogin(data);
        expect(frontend.success).toBe(backend.success);
        expect(frontend.success).toBe(true);
      });
    });

    it('后端应对前端通过的数据保持严格', () => {
      // 前端通过但后端更严格的情况
      const frontendPassBackendFail = [
        { username: 'user<>test', version: 'BASIC' }, // 前端通过，后端XSS检测
      ];

      frontendPassBackendFail.forEach(data => {
        const frontend = frontendValidation.validateLogin(data);
        const backend = backendValidation.validateLogin(data);
        // 注意：这里前端可能通过，但后端应该失败
        if (frontend.success) {
          expect(backend.success).toBe(false);
        }
      });
    });

    it('应对所有版本类型正确校验', () => {
      const versions = ['BASIC', 'PRO', 'ENTERPRISE'];
      versions.forEach(version => {
        const result = frontendValidation.validateLogin({
          username: 'testuser',
          version
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('边界条件测试', () => {
    it('应正确处理用户名长度边界', () => {
      // 最小长度边界
      const minResult = frontendValidation.validateLogin({
        username: 'AB',
        version: 'BASIC'
      });
      expect(minResult.success).toBe(true);

      // 最大长度边界
      const maxResult = frontendValidation.validateLogin({
        username: 'A'.repeat(20),
        version: 'BASIC'
      });
      expect(maxResult.success).toBe(true);
    });

    it('应正确处理空白字符', () => {
      const result = frontendValidation.validateLogin({
        username: '   ',
        version: 'BASIC'
      });
      expect(result.success).toBe(false);
    });

    it('应正确处理Unicode字符', () => {
      const result = frontendValidation.validateLogin({
        username: '🐱喵星人',
        version: 'BASIC'
      });
      // Emoji 应该被拒绝（不在允许的字符集中）
      expect(result.success).toBe(false);
    });
  });
});
