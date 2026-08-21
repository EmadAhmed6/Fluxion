import mongoose, { Document, Types } from "mongoose";
import { type ICreatePost, type IUpdatePost } from "./post.schema.js";
interface IPost extends ICreatePost, Document {
    user: Types.ObjectId;
    likes: Types.ObjectId[];
    shares: Types.ObjectId[];
    sharedPost: Types.ObjectId;
    sharesCount: Number;
    commentsCount: Number;
    postLikesCount: Number;
}
declare const validateCreatePost: (post: Omit<IPost, "user" | "likes">) => import("zod").ZodSafeParseResult<{
    title: string;
    postImage?: {
        url: string;
        publicId: string | null;
    } | undefined;
}>;
declare const validateUpdatePost: (post: Partial<Omit<IUpdatePost, "user" | "likes">>) => import("zod").ZodSafeParseResult<{
    title?: string | undefined;
    postImage?: {
        url: string;
        publicId: string | null;
    } | undefined;
}>;
declare const Post: mongoose.Model<IPost, {}, {}, {}, Document<unknown, {}, IPost, {}, mongoose.DefaultSchemaOptions> & IPost & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPost>;
export { Post, validateCreatePost, validateUpdatePost };
//# sourceMappingURL=post.model.d.ts.map