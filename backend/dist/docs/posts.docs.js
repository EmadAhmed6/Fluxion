// GET    /posts
// POST   /posts
// GET    /posts/{postId}
// PUT    /posts/{postId}
// DELETE /posts/{postId}
// PUT    /posts/{postId}/like
// POST   /posts/{postId}/share
export {};
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog posts management APIs
 */
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 250
 *                 example: My First Blog Post
 *               postImage:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 250
 *                 example: My First Blog Post
 *     responses:
 *       201:
 *         description: Post created successfully
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
 *                   example: Post created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get post by ID
 *     tags:
 *       - Posts
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
 *     responses:
 *       200:
 *         description: Post found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 */
/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Update post
 *     tags:
 *       - Posts
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
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 250
 *                 example: Updated Blog Post
 *               postImage:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 250
 *                 example: Updated Blog Post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post was not found
 */
/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete post
 *     tags:
 *       - Posts
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
 *     responses:
 *       200:
 *         description: Post deleted successfully
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
 *                   example: Post deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post was not found
 */
/**
 * @swagger
 * /posts/{postId}/like:
 *   put:
 *     summary: Like or unlike a post
 *     description: Toggle the current user's like on a post
 *     tags:
 *       - Posts
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
 *     responses:
 *       200:
 *         description: Post like status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: You are not logged in
 *       404:
 *         description: Post was not found
 */
/**
 * @swagger
 * /posts/{postId}/share:
 *   post:
 *     summary: Share a post
 *     description: Create a new post referencing an existing original post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Original Post ID to share
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       201:
 *         description: Post shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Post shared successfully
 *                     savedSharedPost:
 *                       $ref: '#/components/schemas/Post'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Post was not found
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         title:
 *           type: string
 *           example: My First Blog Post
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 65f1a2b3c4d5e6f789012345
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
 *         postImage:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *             publicId:
 *               type: string
 *               nullable: true
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
 *         sharedPost:
 *           type: string
 *           nullable: true
 *           example: 65f1a2b3c4d5e6f789012344
 *         sharesCount:
 *           type: number
 *           example: 5
 *         postLikesCount:
 *           type: number
 *           example: 10
 *         commentsCount:
 *           type: number
 *           example: 2
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
//# sourceMappingURL=posts.docs.js.map