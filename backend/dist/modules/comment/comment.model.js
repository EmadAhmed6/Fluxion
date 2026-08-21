import express from "express";
import mongoose, { Document, model, Schema, Types } from "mongoose";
import { CreateCommentSchema, UpdateCommentSchema, } from "./comment.schema.js";
const CommentSchema = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    commentImage: {
        type: {
            url: { type: String },
            publicId: { type: String, default: null },
        },
        default: {
            url: "",
            publicId: null,
        },
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    commentLikesCount: {
        type: Number,
        default: 0,
    },
    replyLikesCount: {
        type: Number,
        default: 0,
    },
    replyCommentsCount: {
        type: Number,
        default: 0,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});
CommentSchema.virtual("replies", {
    ref: "Comment",
    foreignField: "parentComment",
    localField: "_id",
});
const validateCreateComment = (comment) => {
    return CreateCommentSchema.safeParse(comment);
};
const validateUpdateComment = (comment) => {
    return UpdateCommentSchema.safeParse(comment);
};
const Comment = model("Comment", CommentSchema);
export { Comment, validateCreateComment, validateUpdateComment };
//# sourceMappingURL=comment.model.js.map