import express, { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";
import {
  User,
  validateChangePassword,
  validateUpdateUser,
} from "./user.model.js";
import fs from "fs";
import bcrypt from "bcryptjs";
import Notification from "../notifications/notifications.model.js";

// GET ALL USERS
const getAllUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { search, role, provider } = req.query as {
      search: string;
      role: string;
      provider: string;
    };
    const pageNumber = Number(req.query.pageNumber) || 1;
    const userPerPage = 10;

    const query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }
    if (provider) {
      query.provider = provider;
    }

    const users = await User.find(query)
      .skip((pageNumber - 1) * userPerPage)
      .limit(userPerPage)
      .sort({ isAdmin: -1, createdAt: -1 })
      .select("-password");

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        page: pageNumber,
        pages: Math.ceil(totalUsers / userPerPage),
        limit: userPerPage,
        totalUsers: totalUsers,
      },
    });
    return;
  },
);

// GET USER BY ID
const getUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate({
        path: "posts",
        populate: [
          {
            path: "user",
            select: [
              "_id",
              "fullName",
              "username",
              "profilePicture",
              "jobTitle",
            ],
          },
          {
            path: "likes",
            select: [
              "_id",
              "fullName",
              "username",
              "profilePicture",
              "jobTitle",
            ],
          },
          {
            path: "shares",
            select: [
              "_id",
              "fullName",
              "username",
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
                  "fullName",
                  "username",
                  "profilePicture",
                  "jobTitle",
                ],
              },
              {
                path: "likes",
                select: [
                  "_id",
                  "fullName",
                  "username",
                  "profilePicture",
                  "jobTitle",
                ],
              },
              {
                path: "shares",
                select: [
                  "_id",
                  "fullName",
                  "username",
                  "profilePicture",
                  "jobTitle",
                ],
              },
            ],
          },
        ],
      });
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: user,
    });
    return;
  },
);

// UPDATE USER
const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateUpdateUser(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid Input",
      });
      return;
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "User not found" },
      });
      return;
    }
    if (user.provider !== "local") {
      if (req.body.email && req.body.email !== user.email) {
        res.status(403).json({
          success: false,
          message: "Request failed",
          data: { message: "OAuth accounts cannot change their email" },
        });
        return;
      }
      if (req.body.password) {
        res.status(403).json({
          success: false,
          message: "Request failed",
          data: { message: "OAuth accounts cannot change their password" },
        });
        return;
      }
    }
    const isOwner = req.user?.id === req.params.userId;
    const isSuperAdmin = req.user?.role === "SuperAdmin";

    if (user.role === "SuperAdmin" && !isOwner && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "Request failed",
        data: { message: "You cannot modify Owner's profile" },
      });
      return;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    let userImage: { url: string; publicId: string | null } | undefined =
      undefined;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      userImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      fs.unlinkSync(req.file.path);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          fullName: req.body.fullName,
          username: req.body.username,
          ...(user.provider === "local"
            ? { email: req.body.email, password: req.body.password }
            : {}),
          jobTitle: req.body.jobTitle,
          ...(userImage ? { profilePicture: userImage } : {}),
          bio: req.body.bio,
        },
      },
      { returnDocument: "after", runValidators: true },
    )
      .select("-password")
      .select("+email");

    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: updatedUser,
    });
    return;
  },
);

// Delete Profile Image
const deleteProfileImage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "User not found" },
      });
      return;
    }
    const isOwner = req.user?.id === req.params.userId;
    const isSuperAdmin = req.user?.role === "SuperAdmin";
    if (!isOwner && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "Request failed",
        data: { message: "You cannot delete profile picture" },
      });
      return;
    }
    if (!isOwner && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "Request failed",
        data: { message: "You cannot modify Owner's profile" },
      });
      return;
    }
    if (user.profilePicture?.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $unset: { profilePicture: 1 } },
      { returnDocument: "after", runValidators: true },
    );
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: updatedUser,
    });
    return;
  },
);

// DELETE USER
const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.params.userId);
    if (
      user?.role === "SuperAdmin" &&
      req.user?.id !== req.params.userId &&
      req.user?.role !== "SuperAdmin"
    ) {
      res.status(403).json({
        success: false,
        message: "Request failed",
        data: { message: "You cannot delete Owner's profile" },
      });
      return;
    }
    if (user) {
      await User.findByIdAndDelete(req.params.userId);
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
      return;
    } else {
      res.status(404).json({ success: false, message: "User was not found" });
      return;
    }
  },
);

// CHANGE USER PASSWORD
const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.params.userId as string);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "User not found" },
      });
      return;
    }

    if (user?.provider !== "local") {
      res.status(403).json({
        success: false,
        message: "Request failed",
        data: { message: "OAuth users cannot change passwords" },
      });
      return;
    }

    const { success, error } = validateChangePassword(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid Input",
      });
      return;
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password as string,
    );

    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: "Request failed",
        data: { message: "Current Password is incorrect" },
      });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: { message: "Password changed successfully" },
    });
    return;
  },
);

// TOGGLE USER ADMIN
const toggleAdminStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "User not found" },
      });
      return;
    }
    user.role = user.role === "Admin" ? "User" : "Admin";
    await user.save();
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: {
        message: `User status changed to ${user.role}`,
      },
    });
    return;
  },
);

// FOLLOW USER
const toggleFollowUser = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user?.id as string;
  const targetUserId = req.params.userId as string;
  if (currentUserId === targetUserId) {
    res.status(400).json({
      success: false,
      message: "Request failed",
      data: { message: "You cannot follow yourself" },
    });
    return;
  }
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    res.status(404).json({
      success: false,
      message: "Request failed",
      data: { message: "User was not found" },
    });
    return;
  }
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    res.status(404).json({
      success: false,
      message: "Request failed",
      data: { message: "User not found" },
    });
    return;
  }

  const isFollowing =
    currentUser.following?.some((id) => id.toString() === targetUserId) ||
    false;
  if (isFollowing) {
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    await Notification.findOneAndDelete({
      recipient: targetUserId,
      sender: currentUserId,
      type: "follow",
    });
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: { message: "Unfollowed successfully" },
    });
    return;
  } else {
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    });
    
    await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: "follow",
    });

    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: { message: "Followed successfully" },
    });
    return;
  }
});

// GET USER FOLLOWING
const getUserFollowing = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId as string;
    const user = await User.findById(userId).populate({
      path: "following",
      select: "fullName username profilePicture",
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "User not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: {
        followingCount: user.following?.length || 0,
        following: user.following || [],
      },
    });
    return;
  },
);

// GET USER FOLLOWERS
const getUserFollowers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId as string;
    const user = await User.findById(userId).populate({
      path: "followers",
      select: "fullName username profilePicture",
    });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "User not found" },
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: {
        followersCount: user.followers?.length || 0,
        followers: user.followers || [],
      },
    });
    return;
  },
);

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteProfileImage,
  toggleAdminStatus,
  changePassword,
  toggleFollowUser,
  getUserFollowers,
  getUserFollowing,
};
