import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleAdminStatus,
  changePassword,
  deleteProfileImage,
  toggleFollowUser,
  getUserFollowers,
  getUserFollowing,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "./user.controller.js";
import {
  verifyToken,
  verifyAuthorizedToken,
  verifySuperAdminToken,
} from "../../middlewares/verifyToken.js";
import upload from "../../middlewares/multer.js";
import { authLimiter } from "../../middlewares/limiter.js";
const router = express.Router();

router.route("/").get(verifyToken, getAllUsers);
router.get("/blocked-users", verifyToken, getBlockedUsers);
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

router.patch("/:userId/block", verifyToken, blockUser);
router.patch("/:userId/unblock", verifyToken, unblockUser);

router.post(
  "/:userId/change-password",
  authLimiter,
  verifyAuthorizedToken,
  changePassword,
);

router.get("/:userId/followers", verifyToken, getUserFollowers);
router.get("/:userId/following", verifyToken, getUserFollowing);
router.put("/:userId/follow", verifyToken, toggleFollowUser);

export default router;
