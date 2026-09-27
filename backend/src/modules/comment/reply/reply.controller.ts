import express, { type Request, type Response } from "express";
import fs from "fs";
import asyncHandler from "express-async-handler";
import { Types } from "mongoose";
import {
  Comment,
  validateCreateComment,
  validateUpdateComment,
} from "../comment.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { Post } from "../../posts/post.model.js";
import { User } from "../../user/user.model.js";
import Notification from "../../notifications/notifications.model.js";

// GET ALL REPLIES
const getAllReplies = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parentCommentId = req.params.commentId as string;
    if (
      !parentCommentId ||
      typeof parentCommentId !== "string" ||
      !Types.ObjectId.isValid(parentCommentId)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid Parent Comment ID is required",
      });
      return;
    }

    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      res
        .status(404)
        .json({ success: false, message: "Parent comment was not found" });
      return;
    }

    const replies = await Comment.find({
      parentComment: parentCommentId,
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
      ]);

    res.status(200).json({
      success: true,
      message: "Request processed successfully",
      data: replies,
    });
    return;
  },
);

// REPLY COMMENT
const replyComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parentCommentId = req.params.commentId as string;
    const postId = req.params.postId as string;
    if (
      !parentCommentId ||
      typeof parentCommentId !== "string" ||
      !Types.ObjectId.isValid(parentCommentId) ||
      !postId ||
      typeof postId !== "string" ||
      !Types.ObjectId.isValid(postId)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid Post ID and Parent Comment ID are required",
      });
      return;
    }

    const { success, error } = validateCreateComment({
      postId: postId,
      text: req.body.text,
    } as any);
    if (!success) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid input",
      });
      return;
    }

    const comment = await Comment.findOne({
      _id: parentCommentId,
      postId: postId,
    });

    if (!comment) {
      res.status(404).json({
        success: false,
        data: { message: "Parent comment was not found in this post" },
      });
      return;
    }

    let replyImage: { url: string; publicId: string | null } = {
      url: "",
      publicId: "",
    };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      replyImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const newReply = new Comment({
      postId: postId,
      text: req.body.text,
      user: req.user?.id,
      parentComment: parentCommentId,
      commentImage: req.file ? replyImage : undefined,
    });

    await newReply.save();

    await Comment.findByIdAndUpdate(parentCommentId, {
      $inc: { replyCommentsCount: 1 },
    });
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });
    const finalCommentReply = await Comment.findById(newReply._id).populate(
      "user",
      ["_id", "username", "fullName", "profilePicture", "jobTitle", "bio"],
    );
    const currentUserId = req.user?.id as string;

    if (comment.user.toString() !== currentUserId) {
      await Notification.create({
        recipient: comment.user,
        sender: new Types.ObjectId(currentUserId),
        type: "reply",
        post: new Types.ObjectId(postId),
      });
    }

    res.status(201).json({
      success: true,
      data: finalCommentReply,
    });
    return;
  },
);

// UPDATE REPLY COMMENT
const updateReplyComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const replyCommentId = req.params.replyCommentId as string;
    if (
      !replyCommentId ||
      typeof replyCommentId !== "string" ||
      !Types.ObjectId.isValid(replyCommentId)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid Reply Comment ID is required",
      });
      return;
    }

    if (req.body && Object.keys(req.body).length > 0) {
      const { success, error } = validateUpdateComment(req.body);
      if (!success) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid input",
        });
        return;
      }
    }

    const existingReply = await Comment.findById(replyCommentId);
    if (!existingReply) {
      res.status(404).json({
        success: false,
        message: "Reply comment was not found",
      });
      return;
    }

    const replyOwner = await User.findById(existingReply.user);
    if (
      replyOwner?.role === "SuperAdmin" &&
      existingReply.user.toString() !== req.user?.id &&
      req.user?.role !== "SuperAdmin"
    ) {
      res.status(403).json({
        success: false,
        message: "You cannot edit a SuperAdmin's reply",
      });
      return;
    }

    let replyImage: { url: string; publicId: string | null } | undefined =
      undefined;

    if (req.file) {
      if (existingReply.commentImage?.publicId) {
        await cloudinary.uploader.destroy(existingReply.commentImage.publicId);
      }

      const result = await cloudinary.uploader.upload(req.file.path);
      replyImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      replyCommentId,
      {
        $set: {
          text: req.body?.text,
          commentImage: req.file ? replyImage : undefined,
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
      data: updatedComment,
      message: "Updated reply comment successfully",
    });
  },
);

// DELETE REPLY COMMENT
const deleteReplyComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const replyCommentId = req.params.replyCommentId as string;
    const postId = req.params.postId as string;
    if (
      !replyCommentId ||
      typeof replyCommentId !== "string" ||
      !Types.ObjectId.isValid(replyCommentId)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid Reply Comment ID is required",
      });
      return;
    }
    const replyComment = await Comment.findById(replyCommentId);
    if (!replyComment) {
      res.status(404).json({
        success: false,
        message: "Reply comment was not found",
      });
      return;
    }

    const replyOwner = await User.findById(replyComment.user);
    if (
      replyOwner?.role === "SuperAdmin" &&
      replyComment.user.toString() !== req.user?.id &&
      req.user?.role !== "SuperAdmin"
    ) {
      res.status(403).json({
        success: false,
        message: "You cannot delete a SuperAdmin's reply",
      });
      return;
    }
    if (replyComment.commentImage?.publicId) {
      await cloudinary.uploader.destroy(replyComment.commentImage.publicId);
    }
    await Comment.findByIdAndDelete(replyCommentId);
    await Comment.findByIdAndUpdate(replyComment.parentComment, {
      $inc: { replyCommentsCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Deleted reply comment successfully",
    });
    return;
  },
);

const likeReply = asyncHandler(async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const replyCommentId = req.params.replyCommentId as string;
  const postId = req.params.postId as string;
  const userId = req.user?.id as string;
  if (
    !commentId ||
    typeof commentId !== "string" ||
    !Types.ObjectId.isValid(commentId) ||
    !postId ||
    typeof postId !== "string" ||
    !Types.ObjectId.isValid(postId)
  ) {
    res.status(400).json({
      success: false,
      data: { message: "Valid Parent comment id and post id are required" },
    });
    return;
  }

  if (
    !replyCommentId ||
    typeof replyCommentId !== "string" ||
    !Types.ObjectId.isValid(replyCommentId)
  ) {
    res.status(400).json({
      success: false,
      data: { message: "Invalid reply comment id" },
    });
    return;
  }

  const comment = await Comment.findOne({
    _id: commentId,
    postId: (req as any).params.postId,
  });
  if (!comment) {
    res.status(404).json({
      success: false,
      data: { message: "Comment not found" },
    });
    return;
  }
  const replyComment = await Comment.findById(
    new Types.ObjectId(replyCommentId),
  );
  if (!replyComment) {
    res.status(404).json({
      success: false,
      data: { message: "Comment was not found" },
    });
    return;
  }
  const isLiked = replyComment.likes.some(
    (likeId) => likeId.toString() === userId,
  );
  const updatedComment = await Comment.findByIdAndUpdate(
    new Types.ObjectId(replyCommentId),
    isLiked
      ? {
          $pull: { likes: new Types.ObjectId(userId) },
          $inc: { replyLikesCount: -1 },
        }
      : {
          $push: { likes: new Types.ObjectId(userId) },
          $inc: { replyLikesCount: 1 },
        },
    { new: true, runValidators: true },
  )
    .populate("likes", ["_id", "username", "fullName", "profilePicture"])
    .populate("user", [
      "_id",
      "username",
      "fullName",
      "profilePicture",
      "jobTitle",
      "bio",
    ]);

  const currentUserId = req.user?.id as string;
  if (!isLiked && replyComment.user.toString() !== currentUserId) {
    await Notification.create({
      recipient: replyComment.user,
      sender: new Types.ObjectId(currentUserId),
      type: "like_reply",
      post: new Types.ObjectId(postId),
      comment: new Types.ObjectId(commentId),
    });
  } else if (isLiked) {
    await Notification.findOneAndDelete({
      recipient: replyComment.user,
      sender: new Types.ObjectId(currentUserId),
      type: "like_reply",
      post: new Types.ObjectId(postId),
      comment: new Types.ObjectId(commentId),
    });
  }


  res.status(200).json({
    success: true,
    message: isLiked
      ? "Comment unliked successfully"
      : "Reply comment liked successfully",
    data: updatedComment,
  });
  return;
});

export {
  getAllReplies,
  replyComment,
  updateReplyComment,
  deleteReplyComment,
  likeReply,
};
