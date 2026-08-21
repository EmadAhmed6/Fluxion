import jwt from "jsonwebtoken";
import { Document, Schema, model } from "mongoose";
import { ChangePasswordSchema, ForgotPasswordSchema, LoginSchema, OtpSchema, RegisterSchema, ResetPasswordSchema, UpdateUserSchema, } from "./user.schema.js";
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100,
    },
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 4,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        },
        minLength: 6,
    },
    provider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local",
    },
    jobTitle: {
        type: String,
        default: "User",
        trim: true,
        maxLength: 50,
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 250,
    },
    postsCount: {
        type: Number,
        default: 0,
    },
    otp: {
        type: String,
        default: null,
        select: false,
    },
    otpExpired: {
        type: Date,
        default: null,
        select: false,
    },
    profilePicture: {
        type: {
            url: String,
            publicId: { type: String, default: null },
        },
        default: {
            url: "",
            publicId: null,
        },
    },
    isVerified: { type: Boolean, default: false },
    role: {
        type: String,
        enum: ["User", "Admin", "SuperAdmin"],
        default: "User",
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: { virtuals: true },
});
userSchema.virtual("posts", {
    ref: "Post",
    foreignField: "user",
    localField: "_id",
});
userSchema.methods.generateToken = function () {
    return jwt.sign({
        id: this._id,
        role: this.role,
        username: this.username,
    }, process.env.JWT_SECRET_KEY);
};
const validateRegisterUser = (user) => {
    return RegisterSchema.safeParse(user);
};
const validateLoginUser = (user) => {
    return LoginSchema.safeParse(user);
};
const validateForgotPassword = (email) => {
    return ForgotPasswordSchema.safeParse(email);
};
const validateResetPassword = (password) => {
    return ResetPasswordSchema.safeParse(password);
};
const validateChangePassword = (password) => {
    return ChangePasswordSchema.safeParse(password);
};
const validateVerifyOtp = (data) => {
    return OtpSchema.safeParse(data);
};
const validateUpdateUser = (user) => {
    return UpdateUserSchema.safeParse(user);
};
const User = model("User", userSchema);
export { User, validateRegisterUser, validateLoginUser, validateResetPassword, validateForgotPassword, validateChangePassword, validateVerifyOtp, validateUpdateUser, };
//# sourceMappingURL=user.model.js.map