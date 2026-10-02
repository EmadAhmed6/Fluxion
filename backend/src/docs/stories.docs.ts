// ├── GET    /stories
// ├── GET    /stories/timeline
// ├── GET    /stories/user/{userId}
// ├── POST   /stories
// ├── DELETE /stories/{storyId}
// ├── PUT    /stories/{storyId}/view
// ├── GET    /stories/{storyId}/viewers
// ├── POST   /stories/{storyId}/reply
// └── PATCH  /stories/{storyId}/react

/**
 * @swagger
 * tags:
 *   name: Stories
 *   description: Stories management APIs
 */

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Get active stories
 *     description: Retrieve all stories created within the last 24 hours, newest first.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stories retrieved successfully
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
 *                   example: Stories fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Story'
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /stories/timeline:
 *   get:
 *     summary: Get stories timeline
 *     description: Retrieve stories created within the last 24 hours by the authenticated user and users they follow, grouped by author.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timeline stories retrieved successfully
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
 *                   example: Timeline stories fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StoryGroup'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User was not found
 */

/**
 * @swagger
 * /stories/user/{userId}:
 *   get:
 *     summary: Get a user's active stories
 *     description: Retrieve stories created by the specified user within the last 24 hours. Stories cannot be viewed if either user has blocked the other.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user whose stories to retrieve
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: User stories retrieved successfully
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
 *                   example: User stories fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Story'
 *       400:
 *         description: User ID is invalid
 *       401:
 *         description: Not authorized
 *       403:
 *         description: You cannot access this user's stories
 *       404:
 *         description: User was not found
 */

/**
 * @swagger
 * /stories:
 *   post:
 *     summary: Create a story
 *     description: Create a text-only story or upload an image/video with an optional title. At least a title or file is required. Files are limited to 100 MiB and must be an image or video. Stories expire after 24 hours.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 250
 *                 description: Story text. Required when no file is uploaded; defaults to Story when a file is uploaded without a title.
 *                 example: A beautiful day
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional image or video file (maximum 100 MiB)
 *     responses:
 *       201:
 *         description: Story created successfully
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
 *                   example: Story created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Story'
 *       400:
 *         description: A title or file is required, or the uploaded file is not an image or video
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /stories/{storyId}:
 *   delete:
 *     summary: Delete a story
 *     description: Delete a story owned by the authenticated user.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         description: ID of the story to delete
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Story deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Story deleted successfully
 *               data: null
 *       400:
 *         description: Story ID is invalid or missing
 *       401:
 *         description: Not authorized
 *       403:
 *         description: You are not authorized to delete this story
 *       404:
 *         description: Story was not found
 */

/**
 * @swagger
 * /stories/{storyId}/view:
 *   put:
 *     summary: Mark a story as viewed
 *     description: Record the authenticated user as a viewer. When the story owner views their own story, authorViewed is set to true instead of adding them to views.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         description: ID of the story to mark as viewed
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Story viewed successfully
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
 *                   example: Story viewed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Story'
 *       400:
 *         description: Story ID is invalid or missing
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Story was not found
 */

/**
 * @swagger
 * /stories/{storyId}/viewers:
 *   get:
 *     summary: Get story viewers
 *     description: Retrieve the users who viewed a story. Only the story owner can access this list; the owner is excluded from the results.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         description: ID of the story whose viewers to retrieve
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Viewers fetched successfully
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
 *                   example: Viewers fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StoryUser'
 *       400:
 *         description: Story ID is invalid or missing
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only the story owner can view the viewers list
 *       404:
 *         description: Story was not found
 */

/**
 * @swagger
 * /stories/{storyId}/reply:
 *   post:
 *     summary: Reply to a story
 *     description: Add a text reply from the authenticated user to a story.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         description: ID of the story to reply to
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Text of the reply
 *                 example: This looks amazing!
 *     responses:
 *       200:
 *         description: Story replied successfully
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
 *                   example: Story replied successfully
 *                 data:
 *                   $ref: '#/components/schemas/Story'
 *       400:
 *         description: Story ID and message are required
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Story was not found
 */

/**
 * @swagger
 * /stories/{storyId}/react:
 *   patch:
 *     summary: Toggle a story reaction
 *     description: Add or change the authenticated user's reaction. Sending the same reaction type again removes the reaction.
 *     tags:
 *       - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         description: ID of the story to react to
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 description: Reaction value; sending the same value again removes it
 *                 example: ❤️
 *     responses:
 *       200:
 *         description: Story reaction updated successfully
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
 *                   example: Story reaction updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Story'
 *       400:
 *         description: Story ID and reaction type are required
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Story was not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StoryUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012346
 *         username:
 *           type: string
 *           example: ahmed
 *         fullName:
 *           type: string
 *           example: Ahmed Mohamed
 *         profilePicture:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: https://res.cloudinary.com/example/image/upload/avatar.jpg
 *             publicId:
 *               type: string
 *               nullable: true
 *               example: avatar_123
 *     StoryReaction:
 *       type: object
 *       properties:
 *         user:
 *           oneOf:
 *             - type: string
 *               example: 65f1a2b3c4d5e6f789012346
 *             - $ref: '#/components/schemas/StoryUser'
 *         type:
 *           type: string
 *           example: ❤️
 *     StoryReply:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012347
 *         message:
 *           type: string
 *           example: This looks amazing!
 *     Story:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         author:
 *           oneOf:
 *             - type: string
 *               example: 65f1a2b3c4d5e6f789012346
 *             - $ref: '#/components/schemas/StoryUser'
 *         title:
 *           type: string
 *           example: A beautiful day
 *         imageUrl:
 *           type: string
 *           example: https://res.cloudinary.com/example/image/upload/story.jpg
 *         fileUrl:
 *           type: string
 *           example: ""
 *         fileName:
 *           type: string
 *           example: ""
 *         views:
 *           type: array
 *           items:
 *             type: string
 *             example: 65f1a2b3c4d5e6f789012347
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StoryReply'
 *         authorViewed:
 *           type: boolean
 *           example: false
 *         reactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StoryReaction'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-10-03T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2026-10-03T12:00:00.000Z
 *     StoryGroup:
 *       type: object
 *       properties:
 *         author:
 *           $ref: '#/components/schemas/StoryUser'
 *         stories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Story'
 */
