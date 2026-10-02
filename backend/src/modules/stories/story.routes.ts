import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  createStory,
  deleteStory,
  getAllStories,
  getTimelineStories,
  getUserStories,
  getViewers,
  reactToStory,
  replyToStory,
  viewStory,
} from "./story.controller.js";
import upload from "../../middlewares/multer.js";
const router = express.Router();

router.get("/timeline", verifyToken, getTimelineStories);
router.get("/user/:userId", verifyToken, getUserStories);

router
  .route("/")
  .post(verifyToken, upload.single("file"), createStory)
  .get(verifyToken, getAllStories);

router.delete("/:storyId", verifyToken, deleteStory);

router.put("/:storyId/view", verifyToken, viewStory);
router.get("/:storyId/viewers", verifyToken, getViewers);
router.post("/:storyId/reply", verifyToken, replyToStory);
router.patch("/:storyId/react", verifyToken, reactToStory);

export default router;
