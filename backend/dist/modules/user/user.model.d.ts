import { Document } from "mongoose";
import { type IChangePassword, type ILoginUser, type IOtp, type IRegisterUser, type IResetPassword, type IUserSchema } from "./user.schema.js";
interface IUser extends Document, IUserSchema {
    generateToken: () => string;
    isVerified: boolean;
    postsCount: number;
    role: "User" | "Admin" | "SuperAdmin";
    provider: "local" | "google" | "github";
}
declare const validateRegisterUser: (user: IRegisterUser) => import("zod").ZodSafeParseResult<{
    fullName?: string | undefined;
    username: string;
    email: string;
    jobTitle?: string | undefined;
    password: string;
}>;
declare const validateLoginUser: (user: ILoginUser) => import("zod").ZodSafeParseResult<{
    email?: string | undefined;
    username?: string | undefined;
    password: string;
}>;
declare const validateForgotPassword: (email: string) => import("zod").ZodSafeParseResult<{
    email: string;
}>;
declare const validateResetPassword: (password: IResetPassword) => import("zod").ZodSafeParseResult<{
    password: string;
    confirmPassword: string;
}>;
declare const validateChangePassword: (password: IChangePassword) => import("zod").ZodSafeParseResult<{
    currentPassword: string;
    newPassword: string;
}>;
declare const validateVerifyOtp: (data: IOtp) => import("zod").ZodSafeParseResult<{
    email: string;
    otp: string;
}>;
declare const validateUpdateUser: (user: Partial<IUser> & {
    profilePicture: {
        url: string;
        publicId: string | null;
    };
}) => import("zod").ZodSafeParseResult<{
    fullName?: string | undefined;
    username?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    profilePicture?: {
        url: string;
        publicId: string | null;
    } | undefined;
    jobTitle?: string | undefined;
    otp?: string | undefined;
    otpExpired?: Date | undefined;
    bio?: string | undefined;
}>;
declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export { User, validateRegisterUser, validateLoginUser, validateResetPassword, validateForgotPassword, validateChangePassword, validateVerifyOtp, validateUpdateUser, };
//# sourceMappingURL=user.model.d.ts.map