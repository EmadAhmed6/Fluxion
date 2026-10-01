import mongoose, { model, Schema, Types } from "mongoose";

export interface IReaction {
  user: Types.ObjectId;
  type: string;
}

export interface IChat {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  message: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
  replyTo?: Types.ObjectId;
  isDeleted: boolean;
  isRead: boolean;
  isEdited?: boolean;
  isForwarded?: boolean;
  reactions?: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    audioUrl: {
      type: String,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    isForwarded: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Chat = model<IChat>("Chat", ChatSchema);

export default Chat;
