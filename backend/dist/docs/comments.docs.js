// ├── GET    /posts/{postId}/comments
// ├── POST   /posts/{postId}/comments
// ├── PUT    /posts/{postId}/comments/{commentId}
// ├── DELETE /posts/{postId}/comments/{commentId}
// ├── PUT    /posts/{postId}/comments/{commentId}/like
// ├── GET    /posts/{postId}/comments/{commentId}/replies
// ├── POST   /posts/{postId}/comments/{commentId}/replies
// ├── PUT    /posts/{postId}/comments/{commentId}/replies/{replyCommentId}
// ├── DELETE /posts/{postId}/comments/{commentId}/replies/{replyCommentId}
// └── PUT    /posts/{postId}/comments/{commentId}/replies/{replyCommentId}/like
export {};
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comments and Replies management APIs
 */
/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - in: query
 *         name: commentsPerPost
 *         required: false
 *         description: Number of comments per page
 *         schema:
 *           type: integer
 *           default: 5
 *           example: 5
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Request processed successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Valid Post ID is required
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Create a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: This is a great post!
 *               commentImage:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: This is a great post!
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Request processed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input or Post ID is required
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Updated comment text
 *               commentImage:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Request processed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input or Comment ID is required
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Comment was not found
 */
/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comment has been deleted successfully
 *       400:
 *         description: Comment ID is required
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Comment was not found
 */
/**
 * @swagger
 * /posts/{postId}/comments/{commentId}/like:
 *   put:
 *     summary: Like or unlike a comment
 *     description: Toggle the current user's like on a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *     responses:
 *       200:
 *         description: Comment like status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Request processed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: You must be logged in to like this comment
 *       404:
 *         description: Comment was not found
 */
/**
 * @swagger
 * /posts/{postId}/comments/{commentId}/replies:
 *   get:
 *     summary: Get all replies for a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Parent Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Request processed successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Valid Parent Comment ID is required
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Parent comment was not found
 *   post:
 *     summary: Create a reply to a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Parent Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: This is a reply comment
 *               replyImage:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: This is a reply comment
 *     responses:
 *       201:
 *         description: Reply comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Valid Post ID and Parent Comment ID are required
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Parent comment was not found in this post
 */
/**
 * @swagger
 * /posts/{postId}/comments/{commentId}/replies/{replyCommentId}:
 *   put:
 *     summary: Update a reply comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Parent Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *       - in: path
 *         name: replyCommentId
 *         required: true
 *         description: Reply Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012348
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Updated reply comment text
 *               replyImage:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Updated reply comment text
 *     responses:
 *       200:
 *         description: Updated reply comment successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Updated reply comment successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Valid Post ID and Reply Comment ID are required
 *       401:
 *         description: Not authorized
 *       403:
 *         description: You are not allowed
 *       404:
 *         description: Reply comment was not found
 *   delete:
 *     summary: Delete a reply comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Parent Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *       - in: path
 *         name: replyCommentId
 *         required: true
 *         description: Reply Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012348
 *     responses:
 *       200:
 *         description: Deleted reply comment successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Deleted reply comment successfully
 *       400:
 *         description: Valid Post ID and Reply Comment ID are required
 *       401:
 *         description: Not authorized
 *       403:
 *         description: You are not allowed
 *       404:
 *         description: Reply comment was not found
 */
/**
 * @swagger
 * /posts/{postId}/comments/{commentId}/replies/{replyCommentId}/like:
 *   put:
 *     summary: Like or unlike a reply comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Parent Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *       - in: path
 *         name: replyCommentId
 *         required: true
 *         description: Reply Comment ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012348
 *     responses:
 *       200:
 *         description: Reply comment like status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reply comment liked successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Valid Parent comment id, post id, and reply comment id are required
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Comment or reply comment was not found
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *         postId:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         text:
 *           type: string
 *           example: This is a great post!
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 65f1a2b3c4d5e6f789012347
 *             fullName:
 *               type: string
 *               example: Ahmed Mohamed
 *             username:
 *               type: string
 *               example: ahmed
 *             jobTitle:
 *               type: string
 *               example: Full Stack Engineer
 *             bio:
 *               type: string
 *               example: Software Developer
 *             profilePicture:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 publicId:
 *                   type: string
 *         commentImage:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               example: https://res.cloudinary.com/example/image/upload/comment.jpg
 *             publicId:
 *               type: string
 *               nullable: true
 *               example: comment_image_123
 *         likes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               fullName:
 *                 type: string
 *                 example: Ahmed Mohamed
 *               username:
 *                 type: string
 *                 example: ahmed
 *               jobTitle:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: object
 *         commentLikesCount:
 *           type: number
 *           example: 3
 *         parentComment:
 *           type: string
 *           nullable: true
 *           example: 65f1a2b3c4d5e6f789012346
 *         replyLikesCount:
 *           type: number
 *           example: 2
 *         replyCommentsCount:
 *           type: number
 *           example: 1
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */ 
//# sourceMappingURL=comments.docs.js.map