// ├── GET   /notifications
// ├── PATCH /notifications
// └── PATCH /notifications/{notificationId}

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifications management APIs
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     description: Retrieve the latest 30 notifications for the authenticated user, sorted in descending order by creation date, with populated sender details.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully
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
 *                   example: Request succeed
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /notifications:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Mark all notifications for the authenticated user as read (isRead set to true).
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
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
 *                   example: Request succeed
 *                 data:
 *                   type: object
 *                   properties:
 *                     acknowledged:
 *                       type: boolean
 *                       example: true
 *                     modifiedCount:
 *                       type: number
 *                       example: 5
 *                     upsertedId:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     upsertedCount:
 *                       type: number
 *                       example: 0
 *                     matchedCount:
 *                       type: number
 *                       example: 5
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /notifications/{notificationId}:
 *   patch:
 *     summary: Mark a single notification as read
 *     description: Update a single notification by its ID to mark it as read (isRead set to true). Only the recipient can mark it as read.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         description: ID of the notification to mark as read
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
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
 *                   example: Request succeed
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Request failed
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Notification not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationSender:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012341
 *         fullName:
 *           type: string
 *           example: Ahmed Mohamed
 *         username:
 *           type: string
 *           example: ahmed
 *         profilePicture:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: https://res.cloudinary.com/example/image/upload/avatar.jpg
 *             publicId:
 *               type: string
 *               example: avatar_123
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         recipient:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012340
 *         sender:
 *           oneOf:
 *             - $ref: '#/components/schemas/NotificationSender'
 *             - type: string
 *               example: 65f1a2b3c4d5e6f789012341
 *         type:
 *           type: string
 *           enum:
 *             - follow
 *             - comment
 *             - like
 *             - share
 *             - reply
 *             - like_comment
 *             - like_reply
 *           example: like
 *         post:
 *           type: string
 *           nullable: true
 *           example: 65f1a2b3c4d5e6f789012342
 *         comment:
 *           type: string
 *           nullable: true
 *           example: 65f1a2b3c4d5e6f789012343
 *         reply:
 *           type: string
 *           nullable: true
 *           example: 65f1a2b3c4d5e6f789012344
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-09-27T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2026-09-27T12:00:00.000Z
 */
