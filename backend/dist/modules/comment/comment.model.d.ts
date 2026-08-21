import mongoose, { Document, Types } from "mongoose";
import { type IUpdateComment, type ICreateComment } from "./comment.schema.js";
interface IComment extends Omit<ICreateComment, "postId">, Document {
    postId: Types.ObjectId;
    user: Types.ObjectId;
    likes: Types.ObjectId[];
    replyLikesCount: number;
    commentsCount: Number;
    commentLikesCount: Number;
    parentComment: string | null;
    replyCommentsCount: number;
}
declare const validateCreateComment: (comment: ICreateComment) => import("zod").ZodSafeParseResult<{
    postId: string;
    text: string;
    commentImage?: {
        url: string;
        publicId: string | null;
    } | undefined;
}>;
declare const validateUpdateComment: (comment: IUpdateComment) => import("zod").ZodSafeParseResult<{
    postId?: string | undefined;
    text?: string | undefined;
    commentImage?: {
        url: string;
        publicId: string | null;
    } | undefined;
}>;
declare const Comment: mongoose.Model<IComment, {}, {}, {}, Document<unknown, {}, IComment, {}, mongoose.DefaultSchemaOptions> & IComment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IComment>;
export { Comment, validateCreateComment, validateUpdateComment };
//# sourceMappingURL=comment.model.d.ts.map