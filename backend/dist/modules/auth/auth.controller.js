import express, {} from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { validateRegisterUser, User, validateLoginUser, validateResetPassword, validateForgotPassword, validateVerifyOtp, } from "../user/user.model.js";
import { generateOtpEmailHtml, generateResetPasswordEmailHtml, sendEmail, } from "../../config/Email.js";
// REGISTER USER
const register = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    const { error, success } = validateRegisterUser(req.body);
    if (!success) {
        res.status(400).json({
            data: { message: error.issues[0]?.message || "Invalid Input" },
        });
        return;
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
        if (user?.provider !== "local") {
            res.status(400).json({
                success: false,
                message: "Request failed",
                data: { message: "This email is already signed up via social login" },
            });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                data: {
                    message: user.email === email
                        ? "Account already exists with this email"
                        : "Account already exists with this username",
                },
            });
            return;
        }
        await User.deleteOne({ _id: user._id });
    }
    const genSalt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, genSalt);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = new Date(Date.now() + 10 * 60 * 1000);
    const newUser = new User({
        fullName: req.body.fullName || req.body.username,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isVerified: false,
        otp: generatedOtp,
        otpExpired,
        provider: "local",
    });
    const finalUser = await newUser.save();
    await sendEmail(finalUser.email, "Verify Your Email - Fluxion", generateOtpEmailHtml(finalUser.username, generatedOtp));
    const token = finalUser.generateToken();
    const { password: _, otp: __, otpExpired: ___, ...others } = finalUser.toObject();
    res.status(200).json({
        success: true,
        data: {
            message: "Registered Successfully, Check your email for verification code",
            token,
            ...others,
        },
    });
    return;
});
// LOGIN USER
const login = asyncHandler(async (req, res) => {
    const { email, username } = req.body;
    const { error, success } = validateLoginUser(req.body);
    if (!success) {
        res
            .status(400)
            .json({ message: error.issues[0]?.message || "Invalid Input" });
        return;
    }
    const user = await User.findOne({ $or: [{ email }, { username }] }).select("+otp +otpExpired");
    if (!user) {
        res
            .status(400)
            .json({ success: false, message: "Invalid email or password" });
        return;
    }
    if (user.provider !== "local") {
        res.status(400).json({
            success: false,
            message: "Request failed",
            data: {
                message: "This emails is already signed up via social login",
            },
        });
    }
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
        res
            .status(400)
            .json({ success: false, message: "Invalid email or password" });
        return;
    }
    if (!user.isVerified) {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpired = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = generatedOtp;
        user.otpExpired = otpExpired;
        await user.save();
        await sendEmail(user.email, "Verify Your Email - Fluxion", generateOtpEmailHtml(user.username, generatedOtp));
        res.status(403).json({
            success: false,
            isVerified: false,
            email: user.email,
            message: "Please verify your email. A new OTP code has been sent to your inbox.",
        });
        return;
    }
    const token = user.generateToken();
    const { password: _, otp: __, otpExpired: ___, ...others } = user.toObject();
    res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: { ...others, token },
    });
    return;
});
// VERIFY OTP
const verifyEmailOTP = asyncHandler(async (req, res) => {
    const { success, error } = validateVerifyOtp(req.body);
    if (!success) {
        res.status(400).json({
            success: false,
            message: error.issues[0]?.message || "Invalid Input",
        });
        return;
    }
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpired");
    if (!user) {
        res.status(404).json({ success: false, message: "Email was not found" });
        return;
    }
    if (user.otp !== otp || !user.otpExpired || user.otpExpired < new Date()) {
        res
            .status(400)
            .json({ success: false, message: "Invalid or expired OTP code" });
        return;
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpired = undefined;
    await user.save();
    const { password: _, otp: __, otpExpired: ___, ...others } = user.toObject();
    res.status(200).json({
        success: true,
        data: { message: "Account verified successfully", ...others },
    });
    return;
});
// RESEND OTP
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
    }
    const user = await User.findOne({ email: email.trim() }).select("+otp +otpExpired");
    if (!user) {
        res.status(404).json({ success: false, message: "Email was not found" });
        return;
    }
    if (user.isVerified) {
        res
            .status(400)
            .json({ success: false, message: "Account is already verified" });
        return;
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = generatedOtp;
    user.otpExpired = otpExpired;
    await user.save();
    await sendEmail(user.email, "Verify Your Email - Fluxion", generateOtpEmailHtml(user.username, generatedOtp));
    res.status(200).json({
        success: true,
        data: {
            message: "A new OTP verification code has been sent to your email",
        },
    });
    return;
});
// SEND FORGOT PASSWORD
const sendForgotPasswodLink = asyncHandler(async (req, res) => {
    const { error, success } = validateForgotPassword(req.body);
    if (!success) {
        res
            .status(400)
            .json({ success: false, message: error.issues[0]?.message });
        return;
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: "User was not found" });
        return;
    }
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        res.status(500).json({ message: "Server configuration error" });
        return;
    }
    const token = jwt.sign({ email, id: user.id }, secret, {
        expiresIn: "10m",
    });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const link = `${frontendUrl}/auth/reset-password/${user.id}/${token}`;
    await sendEmail(user.email, "Reset Password Link - Fluxion", generateResetPasswordEmailHtml(user.username, link));
    res.status(200).json({
        success: true,
        data: { message: "Password reset link sent successfully to your email" },
    });
    return;
});
// RESET PASSWORD
const resetPassword = asyncHandler(async (req, res) => {
    const { error, success } = validateResetPassword(req.body);
    if (!success) {
        res
            .status(400)
            .json({ message: error.issues[0]?.message || "Invalid Input" });
        return;
    }
    const user = await User.findById(req.params.userId);
    if (!user) {
        res.status(404).json({ message: "User was not found" });
        return;
    }
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        res.status(500).json({ message: "Server configuration error" });
        return;
    }
    try {
        jwt.verify(req.params.token, secret);
        const genSalt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, genSalt);
        await user.save();
        res.status(200).json({
            data: { message: "Password updated successfully" },
        });
        return;
    }
    catch {
        res.status(400).json({ message: "Invalid or expired token" });
        return;
    }
});
// GET CURRENT USER ME
const getMe = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res
            .status(401)
            .json({ success: false, data: { message: "Not authorized" } });
        return;
    }
    const user = await User.findById(userId)
        .select("-password")
        .populate({
        path: "posts",
        populate: [
            {
                path: "user",
                select: [
                    "_id",
                    "username",
                    "fullName",
                    "profilePicture",
                    "jobTitle",
                ],
            },
            {
                path: "likes",
                select: [
                    "_id",
                    "username",
                    "fullName",
                    "profilePicture",
                    "jobTitle",
                ],
            },
            {
                path: "shares",
                select: [
                    "_id",
                    "username",
                    "fullName",
                    "profilePicture",
                    "jobTitle",
                ],
            },
            {
                path: "sharedPost",
                populate: [
                    {
                        path: "user",
                        select: [
                            "_id",
                            "username",
                            "fullName",
                            "profilePicture",
                            "jobTitle",
                        ],
                    },
                    {
                        path: "likes",
                        select: [
                            "_id",
                            "username",
                            "fullName",
                            "profilePicture",
                            "jobTitle",
                        ],
                    },
                    {
                        path: "shares",
                        select: [
                            "_id",
                            "username",
                            "fullName",
                            "profilePicture",
                            "jobTitle",
                        ],
                    },
                ],
            },
        ],
    });
    if (!user) {
        res
            .status(404)
            .json({ success: false, data: { message: "User not found" } });
        return;
    }
    res.status(200).json({ success: true, data: user });
    return;
});
export { register, login, sendForgotPasswodLink, resetPassword, verifyEmailOTP, resendOTP, getMe, sendEmail, generateOtpEmailHtml, };
//# sourceMappingURL=auth.controller.js.map