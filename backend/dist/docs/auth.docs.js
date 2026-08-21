// ├── POST /auth/register
// ├── POST /auth/login
// ├── GET /auth/github
// ├── GET /auth/github/callback
// ├── POST /auth/verify-otp
// ├── POST /auth/resend-otp
// ├── POST /auth/forgot-password
// ├── POST /auth/reset-password
// └── GET /auth/me
export {};
// Register
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and saves a 6-digit OTP code with expiration in MongoDB
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - username
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ahmed Mohamed
 *               username:
 *                 type: string
 *                 example: ahmed
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               jobTitle:
 *                 type: string
 *                 example: Full Stack Developer
 *     responses:
 *       200:
 *         description: User registered successfully
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
 *                       example: Registered Successfully, Check your email for verification code
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     _id:
 *                       type: string
 *                       example: 65f1a2b3c4d5e6f789012345
 *                     fullName:
 *                       type: string
 *                       example: Ahmed Mohamed
 *                     username:
 *                       type: string
 *                       example: ahmed
 *                     email:
 *                       type: string
 *                       example: ahmed@example.com
 *                     provider:
 *                       type: string
 *                       enum: [local, google, github]
 *                       example: local
 *                     role:
 *                       type: string
 *                       enum: [User, Admin, SuperAdmin]
 *                       example: User
 *       400:
 *         description: Invalid input or email/username already exists
 */
// Login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user with Email or Username (Rate Limited - 5 req/min)
 *     description: Authenticate a user using either their registered email address OR username alongside password. Protected against brute-force (max 5 attempts per minute). Sends new OTP code if email is unverified.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               username:
 *                 type: string
 *                 example: ahmed
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     _id:
 *                       type: string
 *                       example: 65f1a2b3c4d5e6f789012345
 *                     username:
 *                       type: string
 *                       example: ahmed
 *                     email:
 *                       type: string
 *                       example: ahmed@example.com
 *                     provider:
 *                       type: string
 *                       enum: [local, google, github]
 *                       example: local
 *                     role:
 *                       type: string
 *                       enum: [User, Admin, SuperAdmin]
 *                       example: User
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid email/username or password, or attempting local login on OAuth account
 *       403:
 *         description: Account is unverified. A new OTP has been dispatched to email.
 *       429:
 *         description: Too many attempts, please try again after a minute
 */
// GitHub OAuth Initiate
/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth 2.0 Login
 *     description: Redirects user browser to GitHub OAuth authorization screen to authenticate using GitHub account credentials.
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to GitHub authorization URL
 */
// GitHub OAuth Callback
/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth 2.0 Callback URL
 *     description: Passport callback handler after GitHub authorization. Finds or creates DB user with provider set to 'github', generates JWT token, and redirects client to frontend /auth/callback?token=...
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to frontend callback page with JWT token or login error query param
 */
// Resend OTP
/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP verification code
 *     description: Generate and send a new 6-digit OTP code to the specified unverified email address
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *     responses:
 *       200:
 *         description: OTP code sent successfully
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
 *                       example: A new OTP verification code has been sent to your email
 *       400:
 *         description: Account is already verified or invalid input
 *       404:
 *         description: User was not found
 */
// Forgot Password
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset link (Rate Limited - 5 req/min)
 *     description: Send a password reset link to the user's email address. Protected against spam (max 5 requests per minute).
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
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
 *                       example: Password reset link sent successfully to your email
 *       404:
 *         description: User was not found
 *       429:
 *         description: Too many requests, please try again later
 */
// Reset Password
/**
 * @swagger
 * /auth/reset-password/{userId}/{token}:
 *   post:
 *     summary: Reset user password
 *     description: Reset the user's password using the user ID and reset token
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *       - in: path
 *         name: token
 *         required: true
 *         description: Password reset token
 *         schema:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password updated successfully
 *       400:
 *         description: Invalid password or invalid/expired reset token
 *       404:
 *         description: User was not found
 */
// Verify Email OTP
/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify email using OTP
 *     description: Verify the user's account using the 6-digit OTP code stored in MongoDB
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmed@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
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
 *                       example: Account verified successfully
 *                     _id:
 *                       type: string
 *                       example: 65f1a2b3c4d5e6f789012345
 *                     fullName:
 *                       type: string
 *                       example: Ahmed Mohamed
 *                     username:
 *                       type: string
 *                       example: ahmed
 *                     email:
 *                       type: string
 *                       example: ahmed@example.com
 *                     role:
 *                       type: string
 *                       enum: [User, Admin, SuperAdmin]
 *                       example: User
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: Email was not found
 */
// Get Authenticated User (Me)
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     description: Retrieve profile of the currently authenticated user based on JWT token with populated posts, likes, and shares
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     _id:
 *                       type: string
 *                       example: 65f1a2b3c4d5e6f789012345
 *                     fullName:
 *                       type: string
 *                       example: Ahmed Mohamed
 *                     username:
 *                       type: string
 *                       example: ahmed
 *                     email:
 *                       type: string
 *                       example: ahmed@example.com
 *                     jobTitle:
 *                       type: string
 *                       example: Full Stack Developer
 *                     role:
 *                       type: string
 *                       enum: [User, Admin, SuperAdmin]
 *                       example: User
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     postsCount:
 *                       type: number
 *                       example: 3
 *                     profilePicture:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                         publicId:
 *                           type: string
 *       401:
 *         description: Not authorized or no token provided
 *       404:
 *         description: User not found
 */
//# sourceMappingURL=auth.docs.js.map