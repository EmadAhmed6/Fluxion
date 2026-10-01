// GET    /users
// GET    /users/{userId}
// PUT    /users/{userId}
// PATCH  /users/{userId}/toggle-admin
// PATCH  /users/{userId}/block
// PATCH  /users/{userId}/unblock
// GET    /users/blocked-users
// POST   /users/{userId}/change-password
// DELETE /users/{userId}
// DELETE /users/{userId}/profile-image

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */


// GET    /users
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Rate Limited - 100 req/15min)
 *     description: Retrieve list of all users on the platform. Protected by API rate limiter.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 *       429:
 *         description: Too many requests, please try again later
 */

// GET    /users/blocked-users
/**
 * @swagger
 * /users/blocked-users:
 *   get:
 *     summary: Get the authenticated user's blocked users
 *     description: Retrieve the users blocked by the authenticated user, including basic profile information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blocked users retrieved successfully
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
 *                   example: Blocked users fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     blockedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 65f1a2b3c4d5e6f789012345
 *                           fullName:
 *                             type: string
 *                             example: Ahmed Mohamed
 *                           username:
 *                             type: string
 *                             example: ahmed
 *                           jobTitle:
 *                             type: string
 *                             example: Full Stack Engineer
 *                           profilePicture:
 *                             type: object
 *                             properties:
 *                               url:
 *                                 type: string
 *                                 example: https://res.cloudinary.com/example/image/upload/profile.jpg
 *                               publicId:
 *                                 type: string
 *                                 nullable: true
 *                                 example: profile_picture_123
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Authenticated user not found
 */

// PATCH  /users/{userId}/block
/**
 * @swagger
 * /users/{userId}/block:
 *   patch:
 *     summary: Block a user
 *     description: Block the target user, remove follow relationships between both users, and delete notifications between them. Unblocking does not restore removed follow relationships.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to block
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: User blocked successfully
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
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User blocked successfully
 *       400:
 *         description: User is already blocked
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Cannot block yourself
 *       404:
 *         description: Target user or authenticated user not found
 */

// PATCH  /users/{userId}/unblock
/**
 * @swagger
 * /users/{userId}/unblock:
 *   patch:
 *     summary: Unblock a user
 *     description: Remove the block placed by the authenticated user on the target user. This does not restore follow relationships removed when the block was created.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to unblock
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: User unblocked successfully
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
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User unblocked successfully
 *       400:
 *         description: User is not blocked
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Target user or authenticated user not found
 */

// GET    /users/{userId}
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user profile by ID (with populated posts, likes, and shares)
 *     description: Retrieve user profile by MongoDB ObjectId with deep populated posts, likes, and shares.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Profile cannot be accessed because either user has blocked the other
 *       404:
 *         description: User not found
 */

// PUT    /users/{userId}

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user profile
 *     description: Update full name, username, job title, bio, email, password, or profile picture. Access is allowed for account owner or Admins. Super Admin (Owner) profile cannot be updated by regular Admins.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 250
 *                 example: Ahmed Mohamed
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: ahmed
 *               jobTitle:
 *                 type: string
 *                 example: Full Stack Engineer
 *               bio:
 *                 type: string
 *                 example: Software Developer & Tech Enthusiast
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *               role:
 *                 type: string
 *                 enum: [User, Admin, SuperAdmin]
 *                 example: User
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Cannot modify Owner/Super Admin profile
 *       404:
 *         description: User not found
 */

// PATCH  /users/{userId}/toggle-admin
/**
 * @swagger
 * /users/{userId}/toggle-admin:
 *   patch:
 *     summary: Toggle user Admin status (Super Admin Only)
 *     description: Toggle the role of a target user account between User and Admin. Restricted strictly to Super Administrators. Super Admin status cannot be self-toggled.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Admin status toggled successfully
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
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User status changed to Admin
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only Super Admin allowed or forbidden operation
 *       404:
 *         description: User not found
 */

// POST   /users/{userId}/change-password
/**
 * @swagger
 * /users/{userId}/change-password:
 *   post:
 *     summary: Change user password (Owner Only, Rate Limited - 10 req/min)
 *     description: Change account password for authenticated user. Restricted strictly to profile owner (req.user.id === params.userId).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
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
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldSecret123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 72
 *                 example: NewSecret123!
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password changed successfully
 *       400:
 *         description: Invalid input / Zod schema validation error
 *       401:
 *         description: Incorrect current password
 *       403:
 *         description: Cannot change other user's password
 *       404:
 *         description: User not found
 */

// DELETE /users/{userId}


/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account from database. Restricted to profile owner or Admins. Super Admin (Owner) profile cannot be deleted by regular Admins.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User has been deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Cannot delete Owner/Super Admin profile or insufficient permissions
 *       404:
 *         description: User was not found
 */

// DELETE /users/{userId}/profile-image
/**
 * @swagger
 * /users/{userId}/profile-image:
 *   delete:
 *     summary: Delete user profile picture
 *     description: Delete/remove a user's profile picture from Cloudinary and database. Restricted to profile owner or Super Admins.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Profile picture deleted successfully
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Insufficient permissions or cannot modify owner's profile
 *       404:
 *         description: User not found
 */

// PUT  /users/{userId}/follow
/**
 * @swagger
 * /users/{userId}/follow:
 *   put:
 *     summary: Toggle follow/unfollow a user
 *     description: Follow or unfollow another user. If the authenticated user is already following the target, it will unfollow; otherwise it will follow. A user cannot follow themselves.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to follow/unfollow
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Follow status toggled successfully
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
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Followed successfully
 *                     isFollowing:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: User cannot follow themselves
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Target user not found
 */

// GET  /users/{userId}/followers
/**
 * @swagger
 * /users/{userId}/followers:
 *   get:
 *     summary: Get a user's followers list
 *     description: Retrieve the list of users who follow the specified user. Each entry includes basic profile information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user whose followers to retrieve
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Followers list retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65f1a2b3c4d5e6f789012345
 *                       fullName:
 *                         type: string
 *                         example: Ahmed Mohamed
 *                       username:
 *                         type: string
 *                         example: ahmed
 *                       profilePicture:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: https://res.cloudinary.com/example/image/upload/profile.jpg
 *                           publicId:
 *                             type: string
 *                             nullable: true
 *                             example: profile_picture_123
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */

// GET  /users/{userId}/following
/**
 * @swagger
 * /users/{userId}/following:
 *   get:
 *     summary: Get a user's following list
 *     description: Retrieve the list of users that the specified user is following. Each entry includes basic profile information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user whose following list to retrieve
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65f1a2b3c4d5e6f789012345
 *                       fullName:
 *                         type: string
 *                         example: Ahmed Mohamed
 *                       username:
 *                         type: string
 *                         example: ahmed
 *                       profilePicture:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: https://res.cloudinary.com/example/image/upload/profile.jpg
 *                           publicId:
 *                             type: string
 *                             nullable: true
 *                             example: profile_picture_123
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         fullName:
 *           type: string
 *           example: Ahmed Mohamed
 *         username:
 *           type: string
 *           example: ahmed
 *         jobTitle:
 *           type: string
 *           example: Full Stack Engineer
 *         bio:
 *           type: string
 *           example: Software Developer & Tech Enthusiast
 *         email:
 *           type: string
 *           format: email
 *           example: ahmed@example.com
 *         provider:
 *           type: string
 *           enum: [local, google, github]
 *           example: local
 *         role:
 *           type: string
 *           enum: [User, Admin, SuperAdmin]
 *           example: User
 *         isVerified:
 *           type: boolean
 *           example: true
 *         postsCount:
 *           type: number
 *           example: 3
 *         profilePicture:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: https://res.cloudinary.com/example/image/upload/profile.jpg
 *             publicId:
 *               type: string
 *               nullable: true
 *               example: profile_picture_123
 */
