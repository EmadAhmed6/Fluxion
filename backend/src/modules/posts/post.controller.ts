import express, { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import { Post, validateCreatePost, validateUpdatePost } from "./post.model.js";
import path from "path";
import fs from "fs";
import cloudinary from "../../utils/cloudinary.js";
import { Types } from "mongoose";
import { User } from "../user/user.model.js";
import Notification from "../notifications/notifications.model.js";

// GET ALL POSTS
const getAllPosts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { search } = req.query as { search: string };
    const pageNumber = Number(req.query.pageNumber) || 1;
    const postsPerPage = 5;
    const query: any = {};
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }
    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("user", [
        "_id",
        "username",
        "fullName",
        "profilePicture",
        "jobTitle",
        "bio",
      ])
      .populate("likes", [
        "_id",
        "username",
        "fullName",
        "profilePicture",
        "jobTitle",
        "bio",
      ])
      .populate("shares", ["_id", "username", "fullName", "profilePicture"])
      .populate({
        path: "comments",
        populate: [
          {
            path: "user",
            select: ["_id", "username", "fullName", "profilePicture"],
          },
          {
            path: "likes",
            select: ["_id", "username", "fullName", "profilePicture"],
          },
        ],
      })
      .skip((pageNumber - 1) * postsPerPage)
      .limit(postsPerPage)
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: {
        posts,
        page: pageNumber,
        limit: postsPerPage,
        totalPosts,
        totalPages: Math.ceil(totalPosts / postsPerPage),
      },
    });
    return;
  },
);

// GET POST BY ID
const getPostById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const posts = await Post.findById(req.params.postId)
      .populate("user", [
        "_id",
        "username",
        "fullName",
        "profilePicture",
        "jobTitle",
      ])
      .populate("likes", ["_id", "username", "fullName", "profilePicture"])
      .populate("shares", ["_id", "username", "fullName", "profilePicture"])
      .populate({
        path: "comments",
        populate: [
          {
            path: "user",
            select: ["_id", "username", "fullName", "profilePicture"],
          },
          {
            path: "likes",
            select: ["_id", "username", "fullName", "profilePicture"],
          },
        ],
      });
    res.status(200).json({ success: true, data: posts });
    return;
  },
);

// CREATE POST
const createPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { error, success } = validateCreatePost(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid Input",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { postsCount: 1 },
    });

    let postImage: { url: string; publicId: string | null } = {
      url: "",
      publicId: "",
    };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      postImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const newPost = new Post({
      title: req.body.title,
      postImage: req.file ? postImage : undefined,
      user: req.user?.id,
    });

    const finalPost = await newPost.save();
    await finalPost.populate("user", [
      "_id",
      "username",
      "fullName",
      "profilePicture",
      "jobTitle",
      "bio",
    ]);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: finalPost,
    });
    return;
  },
);

// UPDATE POST
const updatePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { error, success } = validateUpdatePost(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid Input",
      });
      return;
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Post was not found" });
      return;
    }

    let postImage: { url: string; publicId: string | null } | undefined =
      undefined;
    if (req.file) {
      if (post.postImage?.publicId) {
        await cloudinary.uploader.destroy(post.postImage.publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      postImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          postImage: req.file ? postImage : undefined,
        },
      },
      { returnDocument: "after" },
    ).populate("user", [
      "_id",
      "username",
      "fullName",
      "profilePicture",
      "jobTitle",
      "bio",
    ]);

    res.status(200).json({ success: true, data: updatedPost });
    return;
  },
);

// DELETE POST
const deletePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Post was not found" });
      return;
    }

    const postOwner = await User.findById(post.user);
    if (
      postOwner?.role === "SuperAdmin" &&
      post.user.toString() !== req.user?.id &&
      req.user?.role !== "SuperAdmin"
    ) {
      res
        .status(403)
        .json({ success: false, message: "You can't delete Owner post" });
      return;
    }
    if (post.postImage && post.postImage.publicId) {
      await cloudinary.uploader.destroy(post.postImage.publicId);
    }

    await Post.findByIdAndDelete(req.params.postId);

    await User.findByIdAndUpdate(post.user, {
      $inc: { postsCount: -1 },
    });

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
    return;
  },
);

// LIKE / UNLIKE POST
const likePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "You are not logged in" });
      return;
    }
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Post was not found" });
      return;
    }

    const isLiked = post.likes.some((like) => like.toString() === userId);
    const userObjectId = new Types.ObjectId(userId);
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      isLiked
        ? {
            $pull: { likes: userObjectId },
            $inc: { postLikesCount: -1 } as any,
          }
        : {
            $push: { likes: userObjectId },
            $inc: { postLikesCount: 1 } as any,
          },
      { new: true },
    ).populate("likes", ["_id", "username", "fullName", "profilePicture"]);

    if (!isLiked && post.user.toString() !== userId) {

      await Notification.create({
        recipient: post.user,
        sender: userObjectId,
        type: "like",
        post: post._id,
      });
    } else if (isLiked) {
      await Notification.findOneAndDelete({
        recipient: post.user,
        sender: userObjectId,
        type: "like",
        post: post._id,
      });
    }

    res.status(200).json({ success: true, data: updatedPost });
    return;

  },
);

// SHARE POST
const sharePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res
      .status(401)
      .json({ success: false, data: { message: "Not authorized" } });
    return;
  }
  const { postId } = req.params;
  const originalPost = await Post.findById(postId);
  if (!originalPost) {
    res
      .status(404)
      .json({ success: false, data: { message: "Post was not found" } });
    return;
  }
  const sharedPostRecord = new Post({
    title: originalPost?.title,
    postImage: originalPost?.postImage,
    user: req.user.id,
    sharedPost: originalPost?._id,
  });

  const savedSharedPost = await sharedPostRecord.save();

  await Post.findByIdAndUpdate(postId, {
    $inc: { sharesCount: 1 },
    $push: { shares: new Types.ObjectId(req.user.id) },
  });
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { postsCount: 1 },
  });

  await Notification.create({
    recipient: originalPost.user,
    post: originalPost._id,
    sender: new Types.ObjectId(req.user.id),
    type: "share",
  });

  res.status(201).json({
    success: true,
    data: { message: "Post shared successfully", savedSharedPost },
  });
  return;
});

export {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  sharePost,
};
