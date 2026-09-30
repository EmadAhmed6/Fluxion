// ├── GET    /chat/conversations
// ├── POST   /chat/{recipientId}/send
// ├── POST   /chat/{recipientId}/audio
// ├── POST   /chat/{recipientId}/{messageId}/reply
// ├── POST   /chat/{recipientId}/{messageId}/forward
// ├── GET    /chat/{userId}
// ├── PATCH  /chat/{userId}/read
// ├── PATCH  /chat/{messageId}/react
// ├── PATCH  /chat/{messageId}
// └── DELETE /chat/{messageId}

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
 * /chat/{recipientId}/send:
 *   post:
 *     summary: Send a chat message
 *     description: Send a text message and/or upload one file attachment (image or non-image, up to 100 MiB). Images are returned as imageUrl; other files are returned as fileUrl with fileName.
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hey, how are you doing?
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Text content of the message (required if no file is provided)
 *                 example: Hey, how are you doing?
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional image or non-image file attachment (maximum 100 MiB)
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
 *         description: Message or file is required
 *       500:
 *         description: Message persistence failed
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /chat/{recipientId}/audio:
 *   post:
 *     summary: Send a voice message
 *     description: Upload and send a recorded audio message. Optionally associates the audio message with a message being replied to.
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
 *         description: MongoDB ObjectId of the recipient user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [audio]
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Recorded audio file (maximum 100 MiB)
 *               replyTo:
 *                 type: string
 *                 description: Optional MongoDB ObjectId of the message being replied to
 *     responses:
 *       201:
 *         description: Voice message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 *       404:
 *         description: Audio file is missing or the reply target was not found
 *       500:
 *         description: Audio upload failed
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /chat/{recipientId}/{messageId}/reply:
 *   post:
 *     summary: Reply to a chat message
 *     description: Send a text reply, a reply with an image or other file, or an attachment-only reply. File uploads are limited to 100 MiB.
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
 *         description: MongoDB ObjectId of the recipient user
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the message being replied to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Optional reply text (a message or file is required)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional image or non-image attachment (maximum 100 MiB)
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Recipient or reply content is missing
 *       404:
 *         description: Reply target was not found
 *       500:
 *         description: Attachment upload failed
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /chat/{recipientId}/{messageId}/forward:
 *   post:
 *     summary: Forward a chat message
 *     description: Create a forwarded copy of an existing text, image, file, or audio message for another recipient. The new message is marked isForwarded=true.
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
 *         description: MongoDB ObjectId of the recipient user
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the message to forward
 *     responses:
 *       201:
 *         description: Forwarded message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Recipient or message ID is missing
 *       404:
 *         description: Original message was not found
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /chat/{id}:
 *   get:
 *     summary: Get chat message history with a user
 *     description: Retrieve the full message history between the authenticated user and the specified user, sorted chronologically. Automatically marks unread incoming messages as read.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 * /chat/{messageId}/react:
 *   patch:
 *     summary: Toggle a reaction on a message
 *     description: Add or change the authenticated user's reaction. Sending the same reaction again removes it.
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
 *         description: MongoDB ObjectId of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reactionType]
 *             properties:
 *               reactionType:
 *                 type: string
 *                 description: Reaction identifier; the chat UI currently uses like, love, care, haha, wow, sad, angry, and eggs.
 *                 example: love
 *     responses:
 *       200:
 *         description: Reaction updated; returns the message with populated reaction users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Message ID or reactionType is missing
 *       403:
 *         description: The authenticated user is not part of the message conversation
 *       404:
 *         description: Message was not found
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /chat/{id}:
 *   patch:
 *     summary: Edit a chat message
 *     description: Update the text of a message sent by the authenticated user. Empty text is rejected; attachments are not edited by this endpoint.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the message to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 example: Updated message text
 *     responses:
 *       200:
 *         description: Message edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 *       403:
 *         description: Only the sender may edit the message
 *       404:
 *         description: Message was not found or the new message is empty
 *       401:
 *         description: Not authorized
 *   delete:
 *     summary: Delete a chat message
 *     description: Soft-delete a chat message (sets isDeleted to true). Only the sender of the message is authorized to delete it.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Message ID is missing
 *       403:
 *         description: You are not authorized to delete this message
 *       404:
 *         description: Message was not found
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
 *             - User
 *             - Admin
 *             - SuperAdmin
 *           example: User
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
 *         fileUrl:
 *           type: string
 *           nullable: true
 *           example: https://res.cloudinary.com/example/raw/upload/report.pdf
 *         fileName:
 *           type: string
 *           nullable: true
 *           example: report.pdf
 *         audioUrl:
 *           type: string
 *           nullable: true
 *           example: https://res.cloudinary.com/example/video/upload/voice-message.webm
 *         replyTo:
 *           oneOf:
 *             - $ref: '#/components/schemas/ChatMessage'
 *             - type: string
 *               example: 65f1a2b3c4d5e6f789012398
 *         reactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatReaction'
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         isRead:
 *           type: boolean
 *           example: false
 *         isEdited:
 *           type: boolean
 *           example: false
 *         isForwarded:
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
 *     ChatReaction:
 *       type: object
 *       properties:
 *         user:
 *           oneOf:
 *             - $ref: '#/components/schemas/ChatUser'
 *             - type: string
 *               example: 65f1a2b3c4d5e6f789012341
 *         type:
 *           type: string
 *           description: Reaction identifier. The chat UI currently uses like, love, care, haha, wow, sad, angry, and eggs.
 *           example: love
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
