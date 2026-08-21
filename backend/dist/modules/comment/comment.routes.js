import express from "express";
const router = express.Router({ mergeParams: true });
import { getAllComments, createComment, updateComment, deleteComment, likeComment, } from "./comment.controller.js";
import replies from "./reply/reply.routes.js";
import { verifyToken, verifyAdminToken, verifyAuthorizedToken, verifyCommentOwner, } from "../../middlewares/verifyToken.js";
import upload from "../../middlewares/multer.js";
router
    .route("/")
    .get(verifyToken, getAllComments)
    .post(verifyToken, upload.single("commentImage"), createComment);
router.put("/:commentId/like", verifyToken, likeComment);
router
    .route("/:commentId")
    .put(verifyCommentOwner, upload.single("commentImage"), updateComment)
    .delete(verifyCommentOwner, deleteComment);
router.use("/:commentId/replies", verifyToken, replies);
export default router;
//# sourceMappingURL=comment.routes.js.map