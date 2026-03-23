import { z } from 'zod';

// Login validation schema (Zod - frontend)
export const LoginSchema = z.object({
  username: z
    .string()
    .min(2, { message: '用户名至少需要2个字符' })
    .max(20, { message: '用户名不能超过20个字符' })
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, {
      message: '用户名只能包含中文、字母、数字和下划线',
    }),
  version: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
});

// Pydantic-like validation for backend simulation
export const validateLogin = (data: { username: string; version: string }) => {
  try {
    const validated = LoginSchema.parse(data);
    return { success: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: [{ field: 'unknown', message: '验证失败' }] };
  }
};

// Token quota validation
export const TokenQuotaSchema = z.object({
  used: z.number().int().min(0),
  total: z.number().int().min(0),
});

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().url(),
  version: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  tokenQuota: TokenQuotaSchema,
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type User = z.infer<typeof UserSchema>;
