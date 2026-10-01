import jwt from "jsonwebtoken";
import { Document, Schema, model, Types } from "mongoose";
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  OtpSchema,
  RegisterSchema,
  ResetPasswordSchema,
  UpdateUserSchema,
  type IChangePassword,
  type ILoginUser,
  type IOtp,
  type IRegisterUser,
  type IResetPassword,
  type IUserSchema,
} from "./user.schema.js";

interface IUser extends Document, IUserSchema {
  generateToken: () => string;
  refreshToken: string;
  generateRefreshToken: () => string;
  isVerified: boolean;
  postsCount: number;
  role: "User" | "Admin" | "SuperAdmin";
  provider: "local" | "google" | "github";
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  blockUsers: Types.ObjectId[];
  blockedByUsers: Types.ObjectId[];
  isBlocked: boolean;
}

const userSchema = new Schema<IUser>(
  {
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
      required: function (this: IUser) {
        return this.provider === "local";
      },
      minLength: 6,
    },
    role: {
      type: String,
      enum: ["User", "Admin", "SuperAdmin"],
      default: "User",
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
    refreshToken: {
      type: String,
      select: false,
    },
    isVerified: { type: Boolean, default: false },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedByUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: { virtuals: true },
  },
);
userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

userSchema.methods.generateToken = function (this: IUser): string {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      username: this.username,
    },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "15m",
    },
  );
};

userSchema.methods.generateRefreshToken = function (this: IUser): string {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_KEY as string, {
    expiresIn: "7d",
  });
};

const validateRegisterUser = (user: IRegisterUser) => {
  return RegisterSchema.safeParse(user);
};
const validateLoginUser = (user: ILoginUser) => {
  return LoginSchema.safeParse(user);
};
const validateForgotPassword = (email: string) => {
  return ForgotPasswordSchema.safeParse(email);
};
const validateResetPassword = (password: IResetPassword) => {
  return ResetPasswordSchema.safeParse(password);
};

const validateChangePassword = (password: IChangePassword) => {
  return ChangePasswordSchema.safeParse(password);
};
const validateVerifyOtp = (data: IOtp) => {
  return OtpSchema.safeParse(data);
};
const validateUpdateUser = (
  user: Partial<IUser> & {
    profilePicture: { url: string; publicId: string | null };
  },
) => {
  return UpdateUserSchema.safeParse(user);
};

const User = model<IUser>("User", userSchema);

export {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateResetPassword,
  validateForgotPassword,
  validateChangePassword,
  validateVerifyOtp,
  validateUpdateUser,
};
