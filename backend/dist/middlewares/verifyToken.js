import jwt from "jsonwebtoken";
import { Post } from "../modules/posts/post.model.js";
import { Comment } from "../modules/comment/comment.model.js";
import { Types } from "mongoose";
import { decode } from "punycode";
const verifyToken = (req, res, next) => {
    let token = req.headers.authorization;
    const secret = process.env.JWT_SECRET_KEY;
    if (typeof secret !== "string" || secret.length === 0) {
        return res.status(500).json({ message: "JWT secret is not configured" });
    }
    if (typeof token !== "string" || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        token = token.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
const verifyRefreshToken = (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    const secret = process.env.JWT_REFRESH_KEY;
    if (typeof secret !== "string" || secret.length === 0) {
        return res
            .status(500)
            .json({ message: "Refresh secret is not configured" });
    }
    if (!refreshToken) {
        return res
            .status(401)
            .json({ message: "No refresh token was found in cookies" });
    }
    try {
        const decoded = jwt.verify(refreshToken, secret);
        req.user = { id: decoded.id, role: decoded.role || "User" };
        next();
    }
    catch (err) {
        return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
    }
};
const verifyAuthorizedToken = (req, res, next) => {
    verifyToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.params.userId;
        if (userId &&
            (typeof userId !== "string" || !Types.ObjectId.isValid(userId))) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (req.user.id === userId ||
            req.user.role === "Admin" ||
            req.user.role === "SuperAdmin") {
            next();
        }
        else {
            return res.status(403).json({ message: "You are not allowed" });
        }
    });
};
const verifyAdminToken = (req, res, next) => {
    verifyToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.role === "Admin" || req.user.role === "SuperAdmin") {
            next();
        }
        else {
            return res
                .status(403)
                .json({ message: "You are not allowed, only admin allowed" });
        }
    });
};
const verifySuperAdminToken = (req, res, next) => {
    verifyToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.role === "SuperAdmin") {
            next();
        }
        else {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
                data: { message: "Only super admin is allowed" },
            });
        }
    });
};
const verifyPostOwner = (req, res, next) => {
    verifyToken(req, res, async () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const postId = req.params.postId;
        if (!postId ||
            typeof postId !== "string" ||
            !Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post was not found" });
        }
        if (post.user?.toString() === req.user.id ||
            req.user.role === "Admin" ||
            req.user.role === "SuperAdmin") {
            next();
        }
        else {
            return res.status(403).json({ message: "You are not allowed" });
        }
    });
};
const verifyCommentOwner = (req, res, next) => {
    verifyToken(req, res, async () => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const commentId = req.params.replyCommentId || req.params.commentId;
        if (!commentId ||
            typeof commentId !== "string" ||
            !Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment was not found" });
        }
        if (comment.user.toString() === req.user.id ||
            req.user.role === "Admin" ||
            req.user.role === "SuperAdmin") {
            next();
        }
        else {
            return res.status(403).json({ message: "You are not allowed" });
        }
    });
};
export { verifyToken, verifyRefreshToken, verifyAuthorizedToken, verifyAdminToken, verifySuperAdminToken, verifyPostOwner, verifyCommentOwner, };
//# sourceMappingURL=verifyToken.js.map