import express from "express";
const router = express.Router({ mergeParams: true });
import { replyComment, updateReplyComment, likeReply, deleteReplyComment, getAllReplies, } from "./reply.controller.js";
import { verifyToken, verifyAdminToken, verifyAuthorizedToken, verifyCommentOwner, } from "../../../middlewares/verifyToken.js";
import upload from "../../../middlewares/multer.js";
router
    .route("/")
    .get(verifyToken, getAllReplies)
    .post(verifyToken, upload.single("replyImage"), replyComment);
router
    .route("/:replyCommentId")
    .put(verifyCommentOwner, upload.single("replyImage"), updateReplyComment)
    .delete(verifyCommentOwner, deleteReplyComment);
router.put("/:replyCommentId/like", verifyToken, likeReply);
export default router;
//# sourceMappingURL=reply.routes.js.map