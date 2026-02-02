import { z } from "zod"

/**
 * Register (signup)
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Login
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Change password (future use)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

/**
 * JWT payload schema (for runtime validation if needed)
 */
export const jwtPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(["ADMIN", "USER"]),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>
