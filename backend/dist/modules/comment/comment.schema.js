import { z } from "zod";
const CreateCommentSchema = z.object({
    postId: z.string(),
    text: z.string().trim().min(1),
    commentImage: z
        .object({
        url: z.string().url(),
        publicId: z.string().nullable(),
    })
        .optional(),
});
const UpdateCommentSchema = CreateCommentSchema.partial();
export { CreateCommentSchema, UpdateCommentSchema };
//# sourceMappingURL=comment.schema.js.map