import mongoose, { Schema, model, Types } from "mongoose";
const NotificationSchema = new Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: [
            "follow",
            "comment",
            "like",
            "share",
            "reply",
            "like_comment",
            "like_reply",
        ],
        required: true,
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
        required: false,
    },
    comment: {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
        required: false,
    },
    reply: {
        type: mongoose.Schema.ObjectId,
        ref: "Reply",
        required: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Notification = model("Notification", NotificationSchema);
export default Notification;
//# sourceMappingURL=notifications.model.js.map