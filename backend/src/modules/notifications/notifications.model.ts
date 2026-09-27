import mongoose, { Schema, model, Types } from "mongoose";

interface INotification extends Document {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type:
    | "follow"
    | "comment"
    | "like"
    | "share"
    | "reply"
    | "like_comment"
    | "like_reply";
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  reply?: Types.ObjectId;
  isRead: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
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
  },
  {
    timestamps: true,
  },
);

const Notification = model<INotification>("Notification", NotificationSchema);

export default Notification;
