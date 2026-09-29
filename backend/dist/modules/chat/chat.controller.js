import asyncHandler from "express-async-handler";
import Chat from "./chat.model.js";
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";
const sendMessage = asyncHandler(async (req, res) => {
    const recipientId = req.params.recipientId;
    const message = req.body.message;
    const senderId = req.user?.id;
    if (!recipientId) {
        res
            .status(400)
            .json({ success: false, message: "Valid recipient is required " });
        return;
    }
    if ((!message || message.trim() === "") && !req.file) {
        res
            .status(400)
            .json({ success: false, message: "Message or image is required" });
        return;
    }
    let imageUrl = undefined;
    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        catch (err) {
            console.error("Cloudinary upload error in chat:", err);
        }
    }
    const newMessage = new Chat({
        sender: senderId,
        recipient: recipientId,
        message: message ? message.trim() : "",
        imageUrl: imageUrl,
    });
    await newMessage.save();
    const populatedMessage = await Chat.findById(newMessage._id)
        .populate("sender", "username fullName profilePicture role")
        .populate("recipient", "username fullName profilePicture role");
    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: populatedMessage,
    });
});
const editMessage = asyncHandler(async (req, res) => {
    const messageId = req.params.messageId;
    const newMessage = req.body.message;
    const currentUserId = req.user?.id;
    if (!messageId) {
        res.status(400).json({
            success: false,
            message: "Request failed",
            data: { message: "Valid message id is required" },
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
    if (message.sender.toString() !== currentUserId) {
        res.status(403).json({
            success: false,
            message: "Request failed",
            data: { message: "You are not authorized to edit this message" },
        });
        return;
    }
    if (!newMessage || newMessage.trim() === "") {
        res.status(400).json({
            success: false,
            message: "Request failed",
            data: { message: "Valid message is required" },
        });
        return;
    }
    message.message = newMessage.trim();
    message.isEdited = true;
    await message.save();
    const updatedMessage = await Chat.findById(message._id)
        .populate("sender", "username fullName profilePicture role")
        .populate("recipient", "username fullName profilePicture role");
    res.status(200).json({
        success: true,
        message: "Message edited successfully",
        data: updatedMessage,
    });
});
const getConversations = asyncHandler(async (req, res) => {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const messages = await Chat.find({
        $or: [{ sender: currentUserId }, { recipient: currentUserId }],
        isDeleted: false,
    })
        .sort({ createdAt: -1 })
        .populate("sender", "username fullName profilePicture role")
        .populate("recipient", "username fullName profilePicture role");
    const conversationsMap = new Map();
    for (const msg of messages) {
        const senderObj = msg.sender;
        const recipientObj = msg.recipient;
        if (!senderObj || !recipientObj)
            continue;
        const isSender = senderObj._id.toString() === currentUserId;
        const otherUser = isSender ? recipientObj : senderObj;
        if (!otherUser || !otherUser._id)
            continue;
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
});
const getMessages = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const currentUserId = req.user?.id;
    if (!userId || !currentUserId) {
        res
            .status(400)
            .json({ success: false, message: "Valid userId is required" });
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
        .populate("recipient", "username fullName profilePicture role");
    await Chat.updateMany({ sender: userId, recipient: currentUserId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
    });
});
const markAsRead = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const currentUserId = req.user?.id;
    if (!userId || !currentUserId) {
        res
            .status(400)
            .json({ success: false, message: "Valid userId is required" });
        return;
    }
    await Chat.updateMany({ sender: userId, recipient: currentUserId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({
        success: true,
        message: "Messages marked as read",
    });
});
const deleteMessage = asyncHandler(async (req, res) => {
    const messageId = req.params.messageId;
    const currentUserId = req.user?.id;
    if (!messageId) {
        res.status(404).json({
            success: false,
            message: "Request failed",
            data: { message: "Valid message Id is required" },
        });
        return;
    }
    const message = await Chat.findById(messageId);
    if (!message) {
        res.status(400).json({
            success: false,
            message: "Request failed",
            data: { message: "Message was not found" },
        });
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
    await message.save();
    res.status(200).json({
        success: true,
        message: "Message deleted successfully",
    });
});
export { sendMessage, editMessage, getConversations, getMessages, markAsRead, deleteMessage, };
//# sourceMappingURL=chat.controller.js.map