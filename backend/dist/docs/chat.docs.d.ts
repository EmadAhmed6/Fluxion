export {};
/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat & Messaging APIs
 */
/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     summary: Get all conversations
 *     description: Retrieve all active conversations for the authenticated user, ordered by most recent message, with interlocutor profile details and unread count.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations retrieved successfully
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
 *                     $ref: '#/components/schemas/ChatConversation'
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /chat/send/{recipientId}:
 *   post:
 *     summary: Send a chat message
 *     description: Send a text message and/or upload an image attachment to another user. If an image is uploaded without text, the message defaults to "📷 Photo".
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the recipient user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Text content of the message (required if no image provided)
 *                 example: Hey, how are you doing?
 *               messageImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file attachment
 *     responses:
 *       201:
 *         description: Message sent successfully
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
 *                   example: Message sent successfully
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Valid recipient is required OR Message or image is required
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /chat/{userId}:
 *   get:
 *     summary: Get chat message history with a user
 *     description: Retrieve the full message history between the authenticated user and the specified user, sorted chronologically. Automatically marks unread incoming messages as read.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the other user in the chat
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 24
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Valid userId is required
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /chat/{userId}/read:
 *   patch:
 *     summary: Mark messages from a user as read
 *     description: Mark all unread incoming messages from the specified user as read (isRead set to true).
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the sender whose messages should be marked as read
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
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
 *                   example: Messages marked as read
 *       400:
 *         description: Valid userId is required
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * /chat/{messageId}:
 *   delete:
 *     summary: Delete a chat message
 *     description: Soft-delete a chat message (sets isDeleted to true). Only the sender of the message is authorized to delete it.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
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
 *                   example: Message deleted successfully
 *       400:
 *         description: Message was not found
 *       403:
 *         description: You are not authorized to delete this message
 *       404:
 *         description: Valid message Id is required
 *       401:
 *         description: Not authorized
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     ChatUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012341
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
 *               example: avatar_123
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *             - superadmin
 *           example: user
 *     ChatMessage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012399
 *         sender:
 *           oneOf:
 *             - $ref: '#/components/schemas/ChatUser'
 *             - type: string
 *               example: 65f1a2b3c4d5e6f789012341
 *         recipient:
 *           oneOf:
 *             - $ref: '#/components/schemas/ChatUser'
 *             - type: string
 *               example: 65f1a2b3c4d5e6f789012340
 *         message:
 *           type: string
 *           example: Hey, how are you doing?
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           example: https://res.cloudinary.com/example/image/upload/chat_img.jpg
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-09-29T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2026-09-29T12:00:00.000Z
 *     ChatConversation:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/ChatUser'
 *         lastMessage:
 *           $ref: '#/components/schemas/ChatMessage'
 *         unreadCount:
 *           type: integer
 *           example: 2
 */
//# sourceMappingURL=chat.docs.d.ts.map