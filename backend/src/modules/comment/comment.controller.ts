import express, { type Request, type Response } from "express";
import fs from "fs";
import asyncHandler from "express-async-handler";
import {
  Comment,
  validateCreateComment,
  validateUpdateComment,
} from "./comment.model.js";
import cloudinary from "../../utils/cloudinary.js";
import { Types } from "mongoose";
import { Post } from "../posts/post.model.js";
import { User } from "../user/user.model.js";
import Notification from "../notifications/notifications.model.js";

// GET ALL COMMENTS
const getAllComments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const pageNumber = Number(req.query.pageNumber) || 1;
    const postId = req.params.postId;
    if (
      !postId ||
      typeof postId !== "string" ||
      !Types.ObjectId.isValid(postId)
    ) {
      res
        .status(400)
        .json({ success: false, message: "Valid Post ID is required" });
      return;
    }

    const commentsPerPost = Number(req.query.commentsPerPost) || 5;

    const comments = await Comment.find({
      postId: new Types.ObjectId(postId),
      parentComment: null,
    })
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
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: [
            "_id",
            "username",
            "fullName",
            "profilePicture",
            "jobTitle",
            "bio",
          ],
        },
      })
      .skip((pageNumber - 1) * commentsPerPost)
      .limit(commentsPerPost)
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: comments,
    });
    return;
  },
);

// CREATE COMMENT
const createComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId;
    if (
      !postId ||
      typeof postId !== "string" ||
      !Types.ObjectId.isValid(postId)
    ) {
      res
        .status(400)
        .json({ success: false, message: "Valid Post ID is required" });
      return;
    }
    const { error, success } = validateCreateComment({
      postId: postId,
      text: req.body.text,
    } as any);
    if (!success) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid Input",
      });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Post was not found" });
      return;
    }

    let commentImage: { url: string; publicId: string | null } = {
      url: "",
      publicId: "",
    };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      commentImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const newComment = new Comment({
      postId: new Types.ObjectId(postId),
      text: req.body.text,
      user: (req as any).user.id,
      commentImage: req.file ? commentImage : undefined,
    });

    await newComment.save();

    const finalComment = await Comment.findById(newComment._id).populate(
      "user",
      ["_id", "username", "fullName", "profilePicture", "jobTitle", "bio"],
    );

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const currentUserId = req.user?.id as string;

    if (post.user.toString() !== currentUserId) {
      await Notification.create({
        recipient: post.user,
        sender: new Types.ObjectId(currentUserId),
        type: "comment",
        post: post._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Request processed successfully",
      data: finalComment,
    });
    return;
  },
);

// UPDATE COMMENT
const updateComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.commentId as string;
    if (
      !commentId ||
      typeof commentId !== "string" ||
      !Types.ObjectId.isValid(commentId)
    ) {
      res
        .status(400)
        .json({ success: false, message: "Valid Comment ID is required" });
      return;
    }

    if (req.body && Object.keys(req.body).length > 0) {
      const { error, success } = validateUpdateComment(req.body);
      if (!success) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid Input",
        });
        return;
      }
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    const commentOwner = await User.findById(comment.user);
    if (
      commentOwner?.role === "SuperAdmin" &&
      comment.user.toString() !== req.user?.id &&
      req.user?.role !== "SuperAdmin"
    ) {
      res.status(403).json({
        success: false,
        message: "You cannot edit a SuperAdmin's comment",
      });
      return;
    }

    let commentImage: { url: string; publicId: string | null } | undefined =
      undefined;

    if (req.file) {
      if (comment.commentImage?.publicId) {
        await cloudinary.uploader.destroy(comment.commentImage.publicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      commentImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      new Types.ObjectId(commentId),
      {
        $set: {
          text: req.body.text,
          commentImage: req.file ? commentImage : undefined,
        },
      },
      { returnDocument: "after", runValidators: true },
    ).populate("user", [
      "_id",
      "username",
      "fullName",
      "profilePicture",
      "jobTitle",
      "bio",
    ]);

    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: updatedComment,
    });
    return;
  },
);

// DELETE COMMENT
const deleteComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.commentId as string;
    if (
      !commentId ||
      typeof commentId !== "string" ||
      !Types.ObjectId.isValid(commentId)
    ) {
      res
        .status(400)
        .json({ success: false, message: "Valid Comment ID is required" });
      return;
    }
    const comment = await Comment.findById(new Types.ObjectId(commentId));
    const commentOwner = await User.findById(comment?.user);
    if (
      commentOwner?.role === "SuperAdmin" &&
      comment?.user.toString() !== req.user?.id &&
      req.user?.role !== "SuperAdmin"
    ) {
      res.status(403).json({
        success: false,
        message: "You cannot delete a SuperAdmin's comment",
      });
      return;
    }
    if (comment) {
      if (comment.commentImage?.publicId) {
        await cloudinary.uploader.destroy(comment.commentImage.publicId);
      }
      await Comment.findByIdAndDelete(new Types.ObjectId(commentId));
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentsCount: -1 },
      });
      res.status(200).json({
        success: true,
        message: "Comment has been deleted successfully",
      });
      return;
    } else {
      res
        .status(404)
        .json({ success: false, message: "Comment was not found" });
      return;
    }
  },
);

// LIKE COMMENT
const likeComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.commentId as string;
    if (!commentId || typeof commentId !== "string") {
      res
        .status(400)
        .json({ success: false, message: "Valid Comment ID is required" });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json({ message: "You must be logged in to like this comment" });
      return;
    }

    const comment = await Comment.findById(new Types.ObjectId(commentId));
    if (!comment) {
      res
        .status(404)
        .json({ success: false, message: "Comment was not found" });
      return;
    }

    const isLiked = comment.likes.some(
      (likeId) => likeId.toString() === userId,
    );
    const updatedComment = await Comment.findByIdAndUpdate(
      new Types.ObjectId(commentId),
      isLiked
        ? { $pull: { likes: userId }, $inc: { commentLikesCount: -1 } }
        : { $push: { likes: userId }, $inc: { commentLikesCount: 1 } },
      { new: true },
    ).populate("likes", [
      "_id",
      "username",
      "fullName",
      "profilePicture",
      "jobTitle",
      "bio",
    ]);

    const currentUserId = req.user?.id as string;
    if (!isLiked && comment.user.toString() !== currentUserId) {
      await Notification.create({
        recipient: comment.user,
        sender: currentUserId,
        type: "like_comment",
        post: comment.postId,
        comment: comment._id,
      });
    } else if (isLiked) {
      await Notification.findOneAndDelete({
        recipient: comment.user,
        sender: currentUserId,
        type: "like_comment",
        post: comment.postId,
        comment: comment._id,
      });
    }


    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: updatedComment,
    });
    return;
  },
);

export {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
};
