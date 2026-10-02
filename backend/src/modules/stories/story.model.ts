import mongoose, { Schema, Types } from "mongoose";

export interface IStory {
  author: Types.ObjectId;
  title: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  views: Types.ObjectId[];
  replies: {
    user: Types.ObjectId;
    message: string;
  }[];
  authorViewed: boolean;
  reactions: {
    user: Types.ObjectId;
    type: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 250,
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
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
      },
    ],
    authorViewed: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Story = mongoose.model<IStory>("Story", StorySchema);
