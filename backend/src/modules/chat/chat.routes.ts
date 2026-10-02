import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import upload from "../../middlewares/multer.js";
import {
  deleteMessage,
  editMessage,
  getConversations,
  getMessages,
  markAsRead,
  replyMessage,
  reactMessage,
  sendMessage,
  forwardMessage,
  sendAudioMessage,
  pinMessage,
  starMessage,
  getPinnedMessages,
  getStarredMessages,
} from "./chat.controller.js";

const router = express.Router();

router.get("/conversations", verifyToken, getConversations);

router.post(
  "/:recipientId/send",
  verifyToken,
  upload.single("file"),
  sendMessage,
);

router.post(
  "/:recipientId/audio",
  verifyToken,
  upload.single("audio"),
  sendAudioMessage,
);

router.post(
  "/:recipientId/:messageId/reply",
  verifyToken,
  upload.single("file"),
  replyMessage,
);

router.post(
  "/:recipientId/:messageId/forward",
  verifyToken,
  upload.single("file"),
  forwardMessage,
);
router.get("/:userId", verifyToken, getMessages);
router.get("/:userId/pinned", verifyToken, getPinnedMessages);
router.get("/:userId/starred", verifyToken, getStarredMessages);
router.patch("/:userId/read", verifyToken, markAsRead);
router.patch("/:messageId/react", verifyToken, reactMessage);
router.patch("/:messageId/pin", verifyToken, pinMessage);
router.patch("/:messageId/star", verifyToken, starMessage);
router
  .route("/:messageId")
  .patch(verifyToken, editMessage)
  .delete(verifyToken, deleteMessage);

export default router;
