import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Chat from "./chat.model.js";
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";
import { Types } from "mongoose";
import { sendError } from "../../middlewares/errors.js";
import { file } from "zod";
import { User } from "../user/user.model.js";
import { request } from "http";

// SEND MESSAGE
const sendMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const recipientId = req.params.recipientId as string;
    const message = req.body.message as string | undefined;
    const senderId = req.user?.id as string;
    if (!recipientId && typeof recipientId !== "string") {
      sendError(res, 400, "Valid recipientId is required");
      return;
    }
    if ((!message || message.trim() === "") && !req.file) {
      sendError(res, 400, "Message or image is required");
      return;
    }
    let imageUrl: string | undefined = undefined;
    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;

    if (req.file) {
      try {
        fileName = Buffer.from(req.file.originalname, "latin1").toString(
          "utf8",
        );
        let result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
          access_mode: "public",
          type: "upload",
        });

        if (req.file.mimetype.startsWith("image/")) {
          imageUrl = result.secure_url;
        } else {
          fileUrl = result.secure_url;
        }

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.error("Cloudinary upload error in chat:", err);
      }
    }

    const recipient = await User.findById(recipientId);
    if (
      recipient?.blockUsers?.some(
        (id) => id.toString() === senderId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    const sender = await User.findById(senderId);
    if (
      sender?.blockUsers?.some(
        (id) => id.toString() === recipientId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    const newMessage = new Chat({
      sender: senderId,
      recipient: recipientId,
      message: message ? message.trim() : "",
      imageUrl: imageUrl || "",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
    });

    await newMessage.save();

    const populatedMessage = await Chat.findById(newMessage._id)
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  },
);

// EDIT MESSAGE
const editMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const messageId = req.params.messageId as string;
    const newMessage = req.body.message as string;
    const currentUserId = req.user?.id as string;

    if (!messageId && typeof messageId !== "string") {
      sendError(res, 400, "Valid messageId is required");
      return;
    }

    const message = await Chat.findById(messageId);
    if (!message) {
      sendError(res, 404, "Message was not fonud");
      return;
    }

    if (message.sender.toString() !== currentUserId) {
      sendError(res, 403, "You are not authorized to edit this message");
      return;
    }

    if (!newMessage || newMessage.trim() === "") {
      sendError(res, 404, "Message was not found");
      return;
    }

    message.message = newMessage.trim();
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Chat.findById(message._id)
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      });

    res.status(200).json({
      success: true,
      message: "Message edited successfully",
      data: updatedMessage,
    });
  },
);

// DELETE MESSAGE
const deleteMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const messageId = req.params.messageId as string;
    const currentUserId = req.user?.id as string;
    if (!messageId && typeof messageId !== "string") {
      sendError(res, 400, "Valid messageId is required");
      return;
    }

    const message = await Chat.findById(messageId);
    if (!message) {
      sendError(res, 404, "Message was not found");
      return;
    }
    if (message?.sender.toString() !== currentUserId) {
      res.status(403).json({
        success: false,
        message: "Request failed",
        data: { message: "You are not authorized to delete this message" },
      });
      return;
    }

    message.isDeleted = true;
    message.message = "";
    message.imageUrl = "";
    message.fileUrl = "";
    message.fileName = "";
    message.audioUrl = "";
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  },
);

// GET CONVERSATIONS
const getConversations = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user?.id as string;
    if (!currentUserId && typeof currentUserId !== "string") {
      sendError(res, 401, "You are not authorized");
      return;
    }

    const messages = await Chat.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture");

    const conversationsMap = new Map<string, any>();

    for (const msg of messages) {
      const senderObj: any = msg.sender;
      const recipientObj: any = msg.recipient;

      if (!senderObj || !recipientObj) continue;

      const isSender = senderObj._id.toString() === currentUserId;
      const otherUser = isSender ? recipientObj : senderObj;
      if (!otherUser || !otherUser._id) continue;
      const otherUserId = otherUser._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (!isSender && !msg.isRead) {
        const conv = conversationsMap.get(otherUserId);
        conv.unreadCount += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: Array.from(conversationsMap.values()),
    });
  },
);

// GET MESSAGES
const getMessages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId as string;
    const currentUserId = req.user?.id as string;
    if (!userId || !currentUserId) {
      sendError(res, 400, "Valid userId is required");
      return;
    }

    const messages = await Chat.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      });

    await Chat.updateMany(
      { sender: userId, recipient: currentUserId, isRead: false },
      { $set: { isRead: true } },
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  },
);

// MARK AS READ
const markAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId as string;
    const currentUserId = req.user?.id as string;
    if (!userId || !currentUserId) {
      sendError(res, 400, "Valid userId is required");
      return;
    }

    await Chat.updateMany(
      { sender: userId, recipient: currentUserId, isRead: false },
      { $set: { isRead: true } },
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  },
);

// REPLY MESSAGE
const replyMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const messageId = req.params.messageId as string;
    const recipientId = req.params.recipientId as string;
    const senderId = req.user?.id as string;
    const message = req.body.message as string | undefined;

    if (!recipientId || !senderId) {
      sendError(res, 400, "Valid recipientId is required");
      return;
    }
    if ((!message || message.trim() === "") && !req.file) {
      sendError(res, 400, "Valid message is required");
      return;
    }

    const parentMessage = await Chat.findById(messageId);
    if (!parentMessage) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "Message was not found" },
      });
      return;
    }

    let imageUrl: string | undefined = undefined;
    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;

    if (req.file) {
      try {
        fileName = Buffer.from(req.file.originalname, "latin1").toString(
          "utf8",
        );
        let result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
          access_mode: "public",
          type: "upload",
        });
        if (req.file.mimetype.startsWith("image/")) {
          imageUrl = result.secure_url;
        } else {
          fileUrl = result.secure_url;
        }

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Request failed",
          data: { message: "Something went wrong! Please try again later." },
        });
        return;
      }
    }

    const recipient = await User.findById(recipientId);
    if (
      recipient?.blockUsers?.some(
        (id) => id.toString() === senderId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    const sender = await User.findById(senderId);
    if (
      sender?.blockUsers?.some(
        (id) => id.toString() === recipientId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    const newReplyMessage = new Chat({
      sender: senderId,
      recipient: recipientId,
      message: message ? message.trim() : "",
      imageUrl: imageUrl || "",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      replyTo: messageId,
    });

    await newReplyMessage.save();

    const populatedReply = await Chat.findById(newReplyMessage._id)
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      });

    res.status(201).json({
      success: true,
      message: "Reply sent successfully",
      data: populatedReply,
    });
  },
);

// FORWARD MESSAGE
const forwardMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const messageId = req.params.messageId as string;
    const recipientId = req.params.recipientId as string;
    const senderId = req.user?.id as string;

    if (!messageId && typeof messageId !== "string") {
      sendError(res, 400, "Valid messageId is required");
      return;
    }
    if (!recipientId && typeof recipientId !== "string") {
      sendError(res, 400, "Valid recipientId is required");
      return;
    }
    const originalMessage = await Chat.findById(messageId);
    if (!originalMessage) {
      sendError(res, 404, "message was not fonud");
      return;
    }

    const recipient = await User.findById(recipientId);
    if (
      recipient?.blockUsers?.some(
        (id) => id.toString() === senderId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    const sender = await User.findById(senderId);
    if (
      sender?.blockUsers?.some(
        (id) => id.toString() === recipientId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    let imageUrl: string | undefined = undefined;
    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;
    if (req.file) {
      try {
        fileName = Buffer.from(req.file.originalname, "latin1").toString(
          "utf8",
        );
        let result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
          access_mode: "public",
          type: "upload",
        });
        if (req.file.mimetype.startsWith("image/")) {
          imageUrl = result.secure_url;
        } else {
          fileUrl = result.secure_url;
        }

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        res.status(400).json({
          success: false,
          message: "Request failed",
          data: "Something went wrong",
        });
      }
    }

    const newForwardedMessage = new Chat({
      sender: senderId,
      recipient: recipientId,
      message: originalMessage.message,
      imageUrl: originalMessage.imageUrl,
      fileUrl: originalMessage.fileUrl,
      fileName: originalMessage.fileName,
      audioUrl: originalMessage.audioUrl,
      isForwarded: true,
    });

    await newForwardedMessage.save();

    const populatedForwardedMessage = await Chat.findById(
      newForwardedMessage._id,
    )
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture");

    res.status(201).json({
      success: true,
      message: "Request succeed",
      data: populatedForwardedMessage,
    });
  },
);

// REACT MESSAGE
const reactMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const messageId = req.params.messageId as string;
    const reactionType = req.body.reactionType;
    const currentUserId = req.user?.id as string;

    if (!messageId || !reactionType) {
      res.status(400).json({
        success: false,
        message: "Request failed",
        data: { message: "Valid message id and reaction type are required" },
      });
      return;
    }

    const message = await Chat.findById(messageId);
    if (!message) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "Message was not found" },
      });
      return;
    }
    if (
      message.sender.toString() !== currentUserId &&
      message.recipient.toString() !== currentUserId
    ) {
      res.status(403).json({
        success: false,
        message: "Request failed",
        data: { message: "You are not authorized to react to this message" },
      });
      return;
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const reactions = message.reactions;
    const existingReactionIndex = reactions.findIndex(
      (r) => r.user.toString() === currentUserId,
    );

    if (existingReactionIndex > -1 && reactions[existingReactionIndex]) {
      if (reactions[existingReactionIndex].type === reactionType) {
        reactions.splice(existingReactionIndex, 1);
      } else {
        reactions[existingReactionIndex].type = reactionType;
      }
    } else {
      reactions.push({
        user: new Types.ObjectId(currentUserId),
        type: reactionType,
      });
    }

    await message.save();
    const updatedMessage = await Chat.findById(message._id)
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture");

    res.status(200).json({
      success: true,
      data: updatedMessage,
    });
  },
);

// SEND AUDIO MESSAGE
const sendAudioMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const recipientId = req.params.recipientId as string;
    const senderId = req.user?.id as string;
    const replyToId = req.body.replyTo as string | undefined;

    if (!recipientId && typeof recipientId !== "string") {
      sendError(res, 400, "Valid recipientId is required");
      return;
    }
    if (!req.file) {
      sendError(res, 404, "Audio file is required!");
      return;
    }

    if (replyToId && !(await Chat.exists({ _id: replyToId }))) {
      sendError(res, 404, "Message was not found");
      return;
    }

    const recipient = await User.findById(recipientId);
    if (
      recipient?.blockUsers?.some(
        (id) => id.toString() === senderId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    const sender = await User.findById(senderId);
    if (
      sender?.blockUsers?.some(
        (id) => id.toString() === recipientId?.toString(),
      )
    ) {
      sendError(res, 403, "You are blocked from messaging this user");
      return;
    }

    let audioUrl: string | undefined = undefined;
    if (req.file) {
      try {
        let result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
        });
        audioUrl = result.secure_url;
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        sendError(res, 500, "Something went error");
        return;
      }
    }
    const newAudioMessage = new Chat({
      recipient: recipientId,
      sender: senderId,
      audioUrl: audioUrl,
      imageUrl: "",
      fileUrl: "",
      fileName: "",
      message: "",
      ...(replyToId ? { replyTo: replyToId } : {}),
    });
    await newAudioMessage.save();

    const populatedMessage = await Chat.findById(newAudioMessage._id)
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      });

    res.status(201).json({
      success: true,
      message: "Audio message sent successfully",
      data: populatedMessage,
    });
  },
);

// PIN MESSAGE
const pinMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const messageId = req.params.messageId as string;
    const currentUserId = req.user?.id as string;
    if (!messageId) {
      sendError(res, 400, "Valid messageId is required");
      return;
    }

    const message = await Chat.findById(messageId);
    if (!message) {
      sendError(res, 404, "Message was not found");
      return;
    }

    const isSender = message?.sender.toString() === currentUserId.toString();
    const isRecipient =
      message?.recipient.toString() === currentUserId.toString();

    if (!isSender && !isRecipient) {
      sendError(res, 403, "You are not authorized to pin this message");
      return;
    }

    message.isPinned = !message.isPinned;
    await message.save();

    const updatedMessage = await Chat.findById(message._id)
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture");

    res.status(200).json({
      success: true,
      message: "Request succeed",
      data: updatedMessage,
    });
  },
);

// PINNED MESSAGES
const getPinnedMessages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user?.id as string;
    const recipientId = req.params.userId as string;

    if (!recipientId || !currentUserId) {
      sendError(res, 400, "Valid recipient ID is required");
      return;
    }
    const pinnedMessages = await Chat.find({
      isPinned: true,
      $or: [
        {
          sender: currentUserId,
          recipient: recipientId,
        },
        {
          sender: recipientId,
          recipient: currentUserId,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      });

    res.status(200).json({
      success: true,
      message: "Request Succeed",
      data: {
        message: "Pinned messages of the user",
        data: pinnedMessages,
      },
    });
  },
);

// STAR MESSAGE
const starMessage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const messageId = req.params.messageId as string;
    const currentUserId = req.user?.id as string;
    if (!messageId) {
      sendError(res, 400, "Valid messageId is required");
      return;
    }

    const message = await Chat.findById(messageId);
    if (!message) {
      sendError(res, 404, "Message was not found");
      return;
    }
    const isSender = message?.sender.toString() === currentUserId.toString();
    const isRecipient =
      message?.recipient.toString() === currentUserId.toString();

    if (!isSender && !isRecipient) {
      sendError(res, 403, "You are not authorized to star this message");
      return;
    }

    message.isStarred = !message.isStarred;
    await message.save();

    const updatedMessage = await Chat.findById(message._id)
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture");

    res.status(200).json({
      success: true,
      message: "Request succeed",
      data: updatedMessage,
    });
  },
);

const getStarredMessages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user?.id as string;
    const recipientId = req.params.userId as string;
    if (!recipientId || !currentUserId) {
      sendError(res, 400, "Valid userId is required");
      return;
    }
    const starredMessages = await Chat.find({
      isStarred: true,
      $or: [
        { sender: currentUserId, recipient: recipientId },
        { sender: recipientId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username fullName profilePicture role")
      .populate("recipient", "username fullName profilePicture role")
      .populate("reactions.user", "username fullName profilePicture")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      });
    res.status(200).json({
      success: true,
      message: "Request succeed",
      data: {
        message: "Starred messages of the user",
        data: starredMessages,
      },
    });
  },
);

export {
  sendMessage,
  editMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  reactMessage,
  replyMessage,
  forwardMessage,
  sendAudioMessage,
  pinMessage,
  starMessage,
  getStarredMessages,
  getPinnedMessages,
};
