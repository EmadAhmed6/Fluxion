import { z } from "zod";
const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must include uppercase, lowercase, and numbers");
const RegisterSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email().trim().min(4),
    password: passwordSchema,
});
const AuthSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email().trim().min(4),
    password: passwordSchema,
    confirmPassword: z.string(),
    otp: z.string().min(6, { message: "Otp Must be at least 6 digits" }),
});
const LoginSchema = z.object({
    email: z.string().email().trim().min(4),
    password: passwordSchema,
});
const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});
const OtpSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    otp: z.string().min(6, { message: "Otp Must be at least 6 digits" }),
});
const ResetPasswordSchema = z
    .object({
    password: passwordSchema,
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Password does not match",
    path: ["confirmPassword"],
});
export { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema, passwordSchema, AuthSchema, OtpSchema, };
//# sourceMappingURL=auth.schema.js.map