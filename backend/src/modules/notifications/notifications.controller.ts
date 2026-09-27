import express, { type Request, type Response } from "express";
import asyncHandler from "express-async-handler";
import Notification from "./notifications.model.js";

// GET ALL NOTIFICATIONS
const getAllNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user?.id as string;
    const notifications = await Notification.find({
      recipient: currentUserId,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("sender", "fullName username profilePicture");

    res.status(200).json({
      success: true,
      message: "Request succeed",
      data: notifications,
    });
    return;
  },
);

// READ ALL NOTIFICATIONS
const readAllNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user?.id as string;
    const updatedNotifications = await Notification.updateMany(
      { recipient: currentUserId },
      { $set: { isRead: true } },
      { runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Request succeed",
      data: updatedNotifications,
    });
    return;
  },
);

// READ NOTIFICATION
const readNotification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const notificationId = req.params.notificationId as string;
    const currentUserId = req.user?.id as string;

    const updatedNotification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: currentUserId,
      },
      { $set: { isRead: true } },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedNotification) {
      res.status(404).json({
        success: false,
        message: "Request failed",
        data: { message: "Notification not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Request succeed",
      data: updatedNotification,
    });
    return;
  },
);

export { getAllNotifications, readNotification, readAllNotifications };
