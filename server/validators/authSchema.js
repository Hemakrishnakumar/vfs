import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email("please provide valid email"),
    password: z.string()
})

export const otpSchema = z.object({
    email: z.email("please provide valid email"),
    otp: z.string().length(4, "otp must be 4 charatcter long")
})

export const registerSchema = loginSchema.extend({
    name: z.string().min(3, "name must be 3 characters long").max(100, "name should not exceed 100 characters"),
    otp: z.string().length(4, "otp must be 4 characters long and only contain numeric digits")
})