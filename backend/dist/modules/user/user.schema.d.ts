import { z } from "zod";
declare const passwordSchema: z.ZodString;
declare const RegisterSchema: z.ZodObject<{
    fullName: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    username: z.ZodString;
    email: z.ZodString;
    jobTitle: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    password: z.ZodString;
}, z.core.$strip>;
declare const LoginSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
declare const OtpSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
}, z.core.$strip>;
declare const ResetPasswordSchema: z.ZodObject<{
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
declare const UserSchema: z.ZodObject<{
    fullName: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    profilePicture: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        publicId: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    jobTitle: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    otp: z.ZodOptional<z.ZodString>;
    otpExpired: z.ZodOptional<z.ZodDate>;
    bio: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
declare const UpdateUserSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    profilePicture: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        publicId: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>>;
    jobTitle: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    otp: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    otpExpired: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
    bio: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, z.core.$strip>;
export { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema, passwordSchema, OtpSchema, UserSchema, UpdateUserSchema, ChangePasswordSchema, };
export type IRegisterUser = z.infer<typeof RegisterSchema>;
export type ILoginUser = z.infer<typeof LoginSchema>;
export type IOtp = z.infer<typeof OtpSchema>;
export type IForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type IResetPassword = z.infer<typeof ResetPasswordSchema>;
export type IChangePassword = z.infer<typeof ChangePasswordSchema>;
export type IUserSchema = z.infer<typeof UserSchema>;
export type IUpdateUser = z.infer<typeof UpdateUserSchema>;
//# sourceMappingURL=user.schema.d.ts.map