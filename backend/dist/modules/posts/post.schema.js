import { z } from "zod";
const CreatePostSchema = z.object({
    title: z.string().trim().min(1).max(250),
    postImage: z
        .object({
        url: z.string().url(),
        publicId: z.string().nullable(),
    })
        .optional(),
});
const UpdatePostSchema = CreatePostSchema.partial();
export { CreatePostSchema, UpdatePostSchema };
//# sourceMappingURL=post.schema.js.map