import express from "express";
import mongoose, { Schema, Document, Types, model } from "mongoose";
import { CreatePostSchema, UpdatePostSchema, } from "./post.schema.js";
const PostSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 250,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    postImage: {
        type: {
            url: { type: String },
            publicId: { type: String, default: null },
        },
        _id: false,
        default: {
            url: "",
            publicId: null,
        },
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    shares: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    sharedPost: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: null,
    },
    sharesCount: {
        type: Number,
        default: 0,
    },
    commentsCount: {
        type: Number,
        default: 0,
    },
    postLikesCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
PostSchema.virtual("comments", {
    ref: "Comment",
    foreignField: "postId",
    localField: "_id",
});
const validateCreatePost = (post) => {
    return CreatePostSchema.safeParse(post);
};
const validateUpdatePost = (post) => {
    return UpdatePostSchema.safeParse(post);
};
const Post = model("Post", PostSchema);
export { Post, validateCreatePost, validateUpdatePost };
//# sourceMappingURL=post.model.js.map