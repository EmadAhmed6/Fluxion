import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import upload from "../../middlewares/multer.js";
import {
  deleteMessage,
  editMessage,
  getConversations,
  getMessages,
  markAsRead,
  reactMessage,
  sendMessage,
} from "./chat.controller.js";

const router = express.Router();

router.get("/conversations", verifyToken, getConversations);

router.post(
  "/send/:recipientId",
  verifyToken,
  upload.single("messageImage"),
  sendMessage,
);

router.patch("/:userId/read", verifyToken, markAsRead);
router.patch("/:messageId/react", verifyToken, reactMessage);

router
  .route("/:messageId")
  .patch(verifyToken, editMessage)
  .delete(verifyToken, deleteMessage);

router.get("/:userId", verifyToken, getMessages);

export default router;
