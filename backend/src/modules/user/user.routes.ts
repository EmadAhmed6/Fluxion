import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleAdminStatus,
  changePassword,
  deleteProfileImage,
} from "./user.controller.js";
import {
  verifyToken,
  verifyAuthorizedToken,
  verifyAdminToken,
  verifySuperAdminToken,
} from "../../middlewares/verifyToken.js";
import upload from "../../middlewares/multer.js";
import { authLimiter } from "../../middlewares/limiter.js";
const router = express.Router();

router.route("/").get(verifyToken, getAllUsers);
router.patch("/:userId/toggle-admin", verifySuperAdminToken, toggleAdminStatus);
router
  .route("/:userId")
  .get(verifyToken, getUserById)
  .put(verifyAuthorizedToken, upload.single("profilePicture"), updateUser)
  .delete(verifyAuthorizedToken, deleteUser);
router.delete(
  "/:userId/profile-image",
  verifyAuthorizedToken,
  deleteProfileImage,
);

router.post(
  "/:userId/change-password",
  authLimiter,
  verifyAuthorizedToken,
  changePassword,
);

export default router;
