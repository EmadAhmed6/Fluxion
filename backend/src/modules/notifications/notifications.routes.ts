import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  getAllNotifications,
  readNotification,
  readAllNotifications,
} from "./notifications.controller.js";
const router = express.Router();

router
  .route("/")
  .get(verifyToken, getAllNotifications)
  .patch(verifyToken, readAllNotifications);

router.patch("/:notificationId", verifyToken, readNotification);

export default router;
