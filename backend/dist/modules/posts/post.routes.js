import express from "express";
import comments from "../comment/comment.routes.js";
import { getAllPosts, getPostById, updatePost, deletePost, createPost, likePost, sharePost, } from "./post.controller.js";
import { verifyToken, verifyAdminToken, verifyAuthorizedToken, verifyPostOwner, } from "../../middlewares/verifyToken.js";
import upload from "../../middlewares/multer.js";
const router = express.Router({ mergeParams: true });
router
    .route("/")
    .get(verifyToken, getAllPosts)
    .post(verifyToken, upload.single("postImage"), createPost);
router.post("/:postId/share", verifyToken, sharePost);
router
    .route("/:postId")
    .get(verifyToken, getPostById)
    .put(verifyPostOwner, upload.single("postImage"), updatePost)
    .delete(verifyPostOwner, deletePost);
router.put("/:postId/like", verifyToken, likePost);
router.use("/:postId/comments", verifyToken, comments);
export default router;
//# sourceMappingURL=post.routes.js.map