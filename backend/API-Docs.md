# Fluxion API Documentation

By Emad Ahmed

---

## General Info

### Base URL

The API is deployed locally and can be accessed at:
`http://localhost:5000`

### Response Wrapping

- **Success Responses**: Wrapped in a consistent envelope structure containing a `success` boolean set to `true` and a `data` field holding the returned resource(s) or success metadata. Deletion responses return `success: true` and a direct `message` field.
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Error Responses**: Most validation and authorization errors use the `sendError` envelope below. Legacy handlers and Express-level errors may return a top-level `message` instead.
  ```json
  {
    "success": false,
    "message": "Request failed",
    "data": { "message": "Error details and description go here" }
  }
  ```

### Authentication

Protected routes require JSON Web Token (JWT) authentication using a dual-token strategy:
- **Access Token**: Short-lived JWT (expires in 15 minutes) passed in the HTTP `Authorization` header as a Bearer token:
  `Authorization: Bearer <your_jwt_token>`
- **Refresh Token**: Long-lived JWT (expires in 7 days) stored securely in an `httpOnly`, `sameSite: strict` HTTP cookie named `refreshToken`.
- **Token Refresh & Logout**: The `/auth/refresh-token` endpoint reads the `refreshToken` cookie and returns a new Access Token. The `/auth/logout` endpoint invalidates the refresh token in the database and clears the cookie.

---

### Rate Limiting & Security

- **Auth Limiter (`/auth/login`, `/auth/forgot-password`, `/auth/resend-otp`)**: Restricted to **10 requests per minute** to prevent brute-force attacks while allowing standard user interactions.
- **API Limiter (`/users/*`, `/posts/*`)**: Restricted to **100 requests per 15 minutes** to ensure server availability and protection against denial-of-service attempts.
- **Upload Limit**: Multer rejects uploaded files larger than **100 MiB**.

---

## Endpoints Overview Table

| #   | Method | Endpoint                                                          | Description                                                      | Auth |    Rate Limit    |
| :-- | :----- | :---------------------------------------------------------------- | :--------------------------------------------------------------- | :--: | :--------------: |
| 1   | POST   | `/auth/register`                                                  | Register a new user account (returns JWT & sets httpOnly cookie) |  ❌  |        —         |
| 2   | POST   | `/auth/login`                                                     | Authenticate user (returns JWT & sets httpOnly cookie)           |  ❌  |  🔒 10 req/min   |
| 3   | POST   | `/auth/refresh-token`                                             | Generate a new access token using httpOnly refreshToken cookie   |  🔒  |        —         |
| 4   | POST   | `/auth/logout`                                                    | Clear httpOnly refreshToken cookie and invalidate refresh session|  ❌  |        —         |
| 5   | GET    | `/auth/github`                                                    | Initiate GitHub OAuth 2.0 Login authorization flow               |  ❌  |        —         |
| 6   | GET    | `/auth/github/callback`                                           | GitHub OAuth 2.0 Callback, Passport auth & JWT redirect          |  ❌  |        —         |
| 7   | POST   | `/auth/verify-otp`                                                | Verify user email using 6-digit DB OTP code                      |  ❌  |        —         |
| 8   | POST   | `/auth/resend-otp`                                                | Resend 6-digit OTP code to unverified email                      |  ❌  |  🔒 10 req/min   |
| 9   | POST   | `/auth/forgot-password`                                           | Send password reset link to user's email                         |  ❌  |  🔒 10 req/min   |
| 10  | POST   | `/auth/reset-password/:userId/:token`                             | Validate reset token and update password                         |  ❌  |        —         |
| 11  | GET    | `/auth/me`                                                        | Retrieve currently authenticated user profile                    |  🔒  |        —         |
| 12  | GET    | `/users`                                                          | Retrieve list of all users                                       |  🔒  | 🔒 100 req/15min |
| 13  | GET    | `/users/:userId`                                                  | Retrieve detailed user profile                                   |  🔒  | 🔒 100 req/15min |
| 14  | PUT    | `/users/:userId`                                                  | Update profile details, jobTitle, bio, avatar (OAuth restricted) |  🔒  | 🔒 100 req/15min |
| 15  | PATCH  | `/users/:userId/toggle-admin`                                     | Toggle user Admin role status (Super Admin Only)                 |  🔒  | 🔒 100 req/15min |
| 16  | POST   | `/users/:userId/change-password`                                  | Change account password (Local Auth Owners Only)                 |  🔒  |  🔒 10 req/min   |
| 17  | DELETE | `/users/:userId`                                                  | Delete user account from the database                            |  🔒  | 🔒 100 req/15min |
| 18  | DELETE | `/users/:userId/profile-image`                                    | Delete user profile picture (Owner or Super Admin Only)          |  🔒  | 🔒 100 req/15min |
| 19  | PUT    | `/users/:userId/follow`                                           | Toggle follow/unfollow a user                                    |  🔒  | 🔒 100 req/15min |
| 20  | GET    | `/users/:userId/followers`                                        | Retrieve the list of followers for a user                        |  🔒  | 🔒 100 req/15min |
| 21  | GET    | `/users/:userId/following`                                        | Retrieve the list of users a user is following                   |  🔒  | 🔒 100 req/15min |
| 22  | GET    | `/users/blocked-users`                                             | Retrieve the authenticated user's blocked users                  |  🔒  | 🔒 100 req/15min |
| 23  | PATCH  | `/users/:userId/block`                                             | Block a user and remove follow relationships                     |  🔒  | 🔒 100 req/15min |
| 24  | PATCH  | `/users/:userId/unblock`                                           | Unblock a previously blocked user                                |  🔒  | 🔒 100 req/15min |
| 25  | GET    | `/posts`                                                          | Retrieve all blog posts with populated user, likes, and shares   |  🔒  | 🔒 100 req/15min |
| 26  | POST   | `/posts`                                                          | Create a new blog post with postImage metadata                   |  🔒  | 🔒 100 req/15min |
| 27  | POST   | `/posts/:postId/share`                                            | Share an existing post & update shares count                     |  🔒  | 🔒 100 req/15min |
| 28  | GET    | `/posts/:postId`                                                  | Retrieve detailed view of a single post by ID                    |  🔒  | 🔒 100 req/15min |
| 29  | PUT    | `/posts/:postId`                                                  | Update title, description, category, or postImage of a post      |  🔒  | 🔒 100 req/15min |
| 30  | DELETE | `/posts/:postId`                                                  | Delete a post and clear its associated media                     |  🔒  | 🔒 100 req/15min |
| 31  | PUT    | `/posts/:postId/like`                                             | Toggle like/unlike status on a blog post                         |  🔒  | 🔒 100 req/15min |
| 32  | GET    | `/posts/:postId/comments`                                         | Retrieve comments for a post                                     |  🔒  | 🔒 100 req/15min |
| 33  | POST   | `/posts/:postId/comments`                                         | Post a new comment (with optional commentImage)                  |  🔒  | 🔒 100 req/15min |
| 34  | PUT    | `/posts/:postId/comments/:commentId/like`                         | Toggle like/unlike on a comment                                  |  🔒  | 🔒 100 req/15min |
| 35  | PUT    | `/posts/:postId/comments/:commentId`                              | Update text or commentImage of a comment                         |  🔒  | 🔒 100 req/15min |
| 36  | DELETE | `/posts/:postId/comments/:commentId`                              | Remove comment & decrement commentsCount on post                 |  🔒  | 🔒 100 req/15min |
| 37  | GET    | `/posts/:postId/comments/:commentId/replies`                      | Get all replies for a parent comment                             |  🔒  | 🔒 100 req/15min |
| 38  | POST   | `/posts/:postId/comments/:commentId/replies`                      | Create a reply under a parent comment (with optional replyImage) |  🔒  | 🔒 100 req/15min |
| 39  | PUT    | `/posts/:postId/comments/:commentId/replies/:replyCommentId`      | Update text content or replyImage of a reply comment             |  🔒  | 🔒 100 req/15min |
| 40  | DELETE | `/posts/:postId/comments/:commentId/replies/:replyCommentId`      | Remove reply comment & decrement replyCommentsCount              |  🔒  | 🔒 100 req/15min |
| 41  | PUT    | `/posts/:postId/comments/:commentId/replies/:replyCommentId/like` | Toggle like/unlike on a reply comment                            |  🔒  | 🔒 100 req/15min |
| 42  | GET    | `/notifications`                                                  | Retrieve all notifications for authenticated user                |  🔒  |        —         |
| 43  | PATCH  | `/notifications`                                                  | Mark all notifications as read for authenticated user            |  🔒  |        —         |
| 44  | PATCH  | `/notifications/:notificationId`                                  | Mark a specific notification as read                             |  🔒  |        —         |
| 45  | GET    | `/chat/conversations`                                             | Retrieve conversations, latest message, and unread counts        |  🔒  |        —         |
| 46  | POST   | `/chat/:recipientId/send`                                         | Send text with an optional image or file attachment               |  🔒  |        —         |
| 47  | POST   | `/chat/:recipientId/audio`                                        | Send a voice message, optionally as a reply                       |  🔒  |        —         |
| 48  | POST   | `/chat/:recipientId/:messageId/reply`                             | Reply with text and/or an optional file                            |  🔒  |        —         |
| 49  | POST   | `/chat/:recipientId/:messageId/forward`                           | Forward an existing message to another user                       |  🔒  |        —         |
| 50  | GET    | `/chat/:userId`                                                   | Retrieve conversation history and mark incoming messages read    |  🔒  |        —         |
| 51  | PATCH  | `/chat/:userId/read`                                              | Mark unread messages from a user as read                         |  🔒  |        —         |
| 52  | PATCH  | `/chat/:messageId/react`                                          | Add, change, or remove a reaction on a message                    |  🔒  |        —         |
| 53  | PATCH  | `/chat/:messageId/pin`                                            | Pin or unpin a message in a conversation                          |  🔒  |        —         |
| 54  | PATCH  | `/chat/:messageId/star`                                           | Star or unstar a message in a conversation                        |  🔒  |        —         |
| 55  | PATCH  | `/chat/:messageId`                                                | Edit a message's text (sender only)                               |  🔒  |        —         |
| 56  | DELETE | `/chat/:messageId`                                                | Soft-delete a message and clear its content (sender only)         |  🔒  |        —         |
| 57  | GET    | `/chat/:userId/pinned`                                            | Retrieve pinned messages in a conversation                        |  🔒  |        —         |
| 58  | GET    | `/chat/:userId/starred`                                           | Retrieve starred messages in a conversation                       |  🔒  |        —         |
| 59  | GET    | `/stories`                                                        | Retrieve active stories                                           |  🔒  |        —         |
| 60  | GET    | `/stories/timeline`                                               | Retrieve followed users' and own stories grouped by author        |  🔒  |        —         |
| 61  | GET    | `/stories/user/:userId`                                           | Retrieve active stories for a user                                |  🔒  |        —         |
| 62  | POST   | `/stories`                                                        | Create a text, image, or video story                              |  🔒  |        —         |
| 63  | DELETE | `/stories/:storyId`                                               | Delete a story owned by the authenticated user                   |  🔒  |        —         |
| 64  | PUT    | `/stories/:storyId/view`                                          | Mark a story as viewed                                            |  🔒  |        —         |
| 65  | GET    | `/stories/:storyId/viewers`                                       | Retrieve viewers of an owned story                               |  🔒  |        —         |
| 66  | POST   | `/stories/:storyId/reply`                                         | Reply to a story                                                  |  🔒  |        —         |
| 67  | PATCH  | `/stories/:storyId/react`                                         | Add, change, or remove a story reaction                           |  🔒  |        —         |

---

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
  - [Follow Feature](#follow-feature)
  - [Block Feature](#block-feature)
- [Post Management Endpoints](#post-management-endpoints)
- [Comment Management Endpoints](#comment-management-endpoints)
- [Story Management Endpoints](#story-management-endpoints)
- [Notification Management Endpoints](#notification-management-endpoints)
- [Chat Management Endpoints](#chat-management-endpoints)
- [Common HTTP Status Codes](#common-http-status-codes)

---

## Authentication Endpoints

### POST /auth/register

Register a new user account on the platform.

#### Request Body

| Field      | Type   | Required | Description                                                                                                 |
| :--------- | :----- | :------: | :---------------------------------------------------------------------------------------------------------- |
| `fullName` | string |    ✅    | Full name of the user (Min length: 3, Max length: 100).                                                     |
| `username` | string |    ✅    | Unique username (Min length: 3, Max length: 50, letters, numbers, underscores).                              |
| `email`    | string |    ✅    | Valid and unique email address (Min length: 4).                                                             |
| `password` | string |    ✅    | Secure password (Min length: 6, Max length: 72).                                                           |

#### Responses

##### Response 200

User registered successfully. Returns user details along with an auto-generated JWT token.

```json
{
  "success": true,
  "data": {
    "message": "Registered Successfully, Check your email for verification code",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "_id": "65f1a2b3c4d5e6f789012345",
    "username": "ahmed",
    "email": "ahmed@example.com",
    "provider": "local",
    "role": "User",
    "isVerified": false,
    "postsCount": 0,
    "profilePicture": {
      "url": "",
      "publicId": null
    },
    "createdAt": "2026-07-20T18:27:31.000Z",
    "updatedAt": "2026-07-20T18:27:31.000Z"
  }
}
```

##### Response 400

Invalid input validation or email/username already exists.

```json
{
  "message": "Email is already exist"
}
```

---

### POST /auth/login

Log in an existing user using either their registered **Email** or **Username** and retrieve their JWT session token.

#### Request Body

| Field      | Type   | Required | Description                                                                |
| :--------- | :----- | :------: | :------------------------------------------------------------------------- |
| `email`    | string |    ❌    | Registered email address (Optional if `username` is provided).             |
| `username` | string |    ❌    | Registered username (Optional if `email` is provided).                     |
| `password` | string |    ✅    | The account password.                                                      |

> **Note**: At least one of `email` or `username` must be provided in the request body.

#### Responses

##### Response 200

Login successful. Returns user account details and the authorization token.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "username": "ahmed",
    "email": "ahmed@example.com",
    "provider": "local",
    "role": "User",
    "isVerified": true,
    "postsCount": 0,
    "profilePicture": {
      "url": "https://res.cloudinary.com/example/image/upload/profile.jpg",
      "publicId": "profile_picture_123"
    },
    "createdAt": "2026-07-20T18:27:31.000Z",
    "updatedAt": "2026-07-20T18:27:31.000Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Response 400

Invalid credentials, or attempting local password login on account signed up via social login.

```json
{
  "message": "Invalid email or password"
}
```

---

### POST /auth/refresh-token

Generate a new Access Token using the `refreshToken` stored in an `httpOnly` cookie.

#### Headers & Cookies

- Requires `refreshToken` HTTP-Only cookie.

#### Responses

##### Response 200

Access token refreshed successfully.

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### Response 401 / 403

No refresh token provided, or invalid/expired refresh token.

```json
{
  "success": false,
  "data": {
    "message": "Invalid or expired refresh token"
  }
}
```

---

### POST /auth/logout

Logout user session by clearing the `refreshToken` HTTP-Only cookie and unsetting it in the database.

#### Headers & Cookies

- Accepts `refreshToken` HTTP-Only cookie.

#### Responses

##### Response 200

User logged out successfully and httpOnly cookie cleared.

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/github

Initiate GitHub OAuth 2.0 1-click login authentication. Redirects client browser to GitHub authorization page.

#### Request Parameters

None required. Triggers standard OAuth redirect.

#### Responses

##### Response 302

Redirects user browser to GitHub OAuth authorization URL (`https://github.com/login/oauth/authorize`).

---

### GET /auth/github/callback

Callback handler for GitHub OAuth 2.0 authentication. Authenticates user, creates MongoDB account if new (`provider: "github"`), generates JWT session token, and redirects to client.

#### Query Parameters

| Parameter | Type   | Required | Description                                           |
| :-------- | :----- | :------: | :---------------------------------------------------- |
| `code`    | string |    ✅    | Authorization code sent by GitHub after user consent. |

#### Responses

##### Response 302

Login successful. Redirects to frontend callback page with signed JWT token.

```
Redirect URL: ${FRONTEND_URL}/auth/callback?token=<JWT_TOKEN>
```

##### Response 400

Social login conflict or missing account details.

```json
{
  "success": false,
  "message": "This email is already signed up via social login"
}
```

---

### POST /auth/verify-otp

Verify the user's email address using the 6-digit OTP code sent during registration.

#### Request Body

| Field   | Type   | Required | Description                             |
| :------ | :----- | :------: | :-------------------------------------- |
| `email` | string |    ✅    | The registered email address to verify. |
| `otp`   | number |    ✅    | The 6-digit verification code.          |

#### Responses

##### Response 200

Account verified successfully. Returns user account details.

```json
{
  "success": true,
  "data": {
    "message": "Account verified successfully",
    "_id": "65f1a2b3c4d5e6f789012345",
    "username": "ahmed",
    "email": "ahmed@example.com",
    "role": "User",
    "isVerified": true,
    "postsCount": 0,
    "profilePicture": {
      "url": "",
      "publicId": null
    },
    "createdAt": "2026-07-20T18:27:31.000Z",
    "updatedAt": "2026-07-20T18:27:31.000Z"
  }
}
```

##### Response 400

Invalid or expired OTP token.

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

##### Response 404

Email was not found.

```json
{
  "success": false,
  "message": "Email was not found"
}
```

---

### POST /auth/resend-otp

Resend a 6-digit OTP verification code to an unverified email account.

#### Request Body

| Field   | Type   | Required | Description                   |
| :------ | :----- | :------: | :---------------------------- |
| `email` | string |    ✅    | The unverified email address. |

#### Responses

##### Response 200

OTP code sent successfully.

```json
{
  "success": true,
  "data": {
    "message": "A new OTP verification code has been sent to your email"
  }
}
```

##### Response 400

Account is already verified or email format is invalid.

```json
{
  "message": "This account is already verified"
}
```

##### Response 404

Email was not found.

```json
{
  "message": "User was not found"
}
```

---

### POST /auth/forgot-password

Send a secure temporary password reset URL link to the user's registered email address.

#### Request Body

| Field   | Type   | Required | Description                                    |
| :------ | :----- | :------: | :--------------------------------------------- |
| `email` | string |    ✅    | The email address associated with the account. |

#### Responses

##### Response 200

Password reset email dispatched successfully.

```json
{
  "success": true,
  "data": {
    "message": "Password reset link sent successfully to your email"
  }
}
```

##### Response 404

User account with the provided email address does not exist.

```json
{
  "message": "User was not found"
}
```

---

### POST /auth/reset-password/:userId/:token

Verify the reset token in the URL parameters and change the user's password.

#### Path Parameters

| Parameter | Type   | Required | Description                                       |
| :-------- | :----- | :------: | :------------------------------------------------ |
| `userId`  | string |    ✅    | Hexadecimal MongoDB ObjectId of the user account. |
| `token`   | string |    ✅    | Temporary signed JWT password reset token.        |

#### Request Body

| Field             | Type   | Required | Description                                            |
| :---------------- | :----- | :------: | :----------------------------------------------------- |
| `password`        | string |    ✅    | The new secure password.                               |
| `confirmPassword` | string |    ✅    | Password confirmation (must exactly match `password`). |

#### Responses

##### Response 200

Password updated successfully.

```json
{
  "data": {
    "message": "Password updated successfully"
  }
}
```

##### Response 400

Mismatch in passwords, validation error, or the reset token has expired or is invalid.

```json
{
  "message": "Passwords do not match"
}
```

##### Response 404

The user target was not found in the database.

```json
{
  "message": "User was not found"
}
```

---

## User Management Endpoints

### GET /users 🔒

Retrieve a list of all registered users on the system.

#### Responses

##### Response 200

Successfully retrieved users list.

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012345",
      "username": "Ahmed",
      "email": "ahmed@example.com",
      "role": "User",
      "isVerified": true,
      "postsCount": 0,
      "profilePicture": {
        "url": "https://res.cloudinary.com/example/image/upload/profile.jpg",
        "publicId": "profile_picture_123"
      },
      "createdAt": "2026-07-20T18:27:31.000Z",
      "updatedAt": "2026-07-20T18:27:31.000Z"
    }
  ]
}
```

##### Response 401

Missing or invalid JWT token.

```json
{
  "message": "No token provided"
}
```

---

### GET /users/:userId 🔒

Retrieve profile information of a single user by their database ID.

#### Path Parameters

| Parameter | Type   | Required | Description         |
| :-------- | :----- | :------: | :------------------ |
| `userId`      | string |    ✅    | The target user ID. |

#### Responses

##### Response 200

Successfully retrieved user details.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "username": "Ahmed",
    "email": "ahmed@example.com",
    "role": "User",
    "isVerified": true,
    "postsCount": 0,
    "profilePicture": {
      "url": "https://res.cloudinary.com/example/image/upload/profile.jpg",
      "publicId": "profile_picture_123"
    },
    "createdAt": "2026-07-20T18:27:31.000Z",
    "updatedAt": "2026-07-20T18:27:31.000Z"
  }
}
```

##### Response 401

Not authorized.

```json
{
  "message": "Invalid token"
}
```

##### Response 403

The authenticated user or the target user has blocked the other. Profile details and posts are unavailable while the block is active.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "You cannot access this profile due to block status"
  }
}
```

##### Response 404

User with specified ID was not found.

```json
{
  "message": "User not found"
}
```

---

### PUT /users/:userId 🔒

Update user profile information (Username, Email, or Password). Access is restricted to the profile owner or users with Admin privileges.

#### Path Parameters

| Parameter | Type   | Required | Description                   |
| :-------- | :----- | :------: | :---------------------------- |
| `userId`      | string |    ✅    | The ID of the user to update. |

#### Request Body

| Field      | Type   | Required | Description                                       |
| :--------- | :----- | :------: | :------------------------------------------------ |
| `username` | string |    ❌    | Updated username (Min length: 3, Max length: 10). |
| `email`    | string |    ❌    | Updated email address.                            |
| `password` | string |    ❌    | Updated password (must pass validation checks).   |

#### Responses

##### Response 200

Profile updated successfully. Returns updated user document.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "username": "AhmedUpdated",
    "email": "ahmed.new@example.com",
    "role": "User",
    "isVerified": true,
    "postsCount": 0,
    "profilePicture": {
      "url": "https://res.cloudinary.com/example/image/upload/profile.jpg",
      "publicId": "profile_picture_123"
    },
    "createdAt": "2026-07-20T18:27:31.000Z",
    "updatedAt": "2026-07-20T21:27:00.000Z"
  }
}
```

##### Response 400

Zod schema input validation failure.

```json
{
  "message": "String must contain at least 3 character(s)"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 403

Access Forbidden. The requesting user is not the owner of this account and is not an Administrator, OR attempting to modify email/password on an OAuth account (`provider !== "local"`).

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "OAuth accounts cannot change their email"
  }
}
```

##### Response 404

The user target profile was not found.

```json
{
  "message": "User not found"
}
```

---

### PATCH /users/:userId/toggle-admin 🔒

Toggle the role of a target user account (`User` <-> `Admin`). **Super Admin-only endpoint.** Super Admin status cannot be self-toggled.

#### Path Parameters

| Parameter | Type   | Required | Description                   |
| :-------- | :----- | :------: | :---------------------------- |
| `userId`      | string |    ✅    | The target user ID to update. |

#### Responses

##### Response 200

Admin status toggled successfully.

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "message": "User status changed to Admin"
  }
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 403

Forbidden. Requesting user is not a Super Administrator or attempted forbidden operation.

```json
{
  "success": false,
  "message": "Forbidden",
  "data": {
    "message": "Only super admin is allowed"
  }
}
```

##### Response 404

User target was not found.

```json
{
  "message": "User not found"
}
```

---

### POST /users/:userId/change-password 🔒

Change the account password for an authenticated user. **Restricted strictly to profile owner (`req.user.id === params.userId`).** Protected by rate limiting (10 req/min).

#### Path Parameters

| Parameter | Type   | Required | Description                        |
| :-------- | :----- | :------: | :--------------------------------- |
| `userId`  | string |    ✅    | The ID of the target user account. |

#### Request Body

| Field             | Type   | Required | Description                                                                                                  |
| :---------------- | :----- | :------: | :----------------------------------------------------------------------------------------------------------- |
| `currentPassword` | string |    ✅    | The user's current password.                                                                                 |
| `newPassword`     | string |    ✅    | The new password (Min length: 6, Max length: 72, must contain uppercase, lowercase, and numeric characters). |

#### Responses

##### Response 200

Password changed successfully.

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "message": "Password changed successfully"
  }
}
```

##### Response 400

Zod schema input validation failure or missing required fields.

```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

##### Response 401

Current password provided is incorrect.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "Current Password is incorrect"
  }
}
```

##### Response 403

Forbidden. Requesting user is attempting to change another user's password OR account is signed up via OAuth (`provider !== "local"`).

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "OAuth accounts cannot change passwords"
  }
}
```

##### Response 404

Target user account was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "User not found"
  }
}
```

---

### DELETE /users/:userId 🔒

Delete a user from the database. Restricted to profile owner or Admins. **Owner / Super Admin profiles cannot be deleted by regular Admins.**

#### Path Parameters

| Parameter | Type   | Required | Description                   |
| :-------- | :----- | :------: | :---------------------------- |
| `userId`      | string |    ✅    | The target user ID to delete. |

#### Responses

##### Response 200

User deleted successfully.

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 403

Forbidden. Attempted to delete Super Admin (Owner) profile or user is not allowed.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "You cannot delete Owner's profile"
  }
}
```

##### Response 404

User was not found in the system database.

```json
{
  "message": "User was not found"
}
```

---

### DELETE /users/:userId/profile-image 🔒

Delete/remove a user's profile picture from Cloudinary and the database. Restricted to the profile owner or Super Admins.

#### Path Parameters

| Parameter | Type   | Required | Description                              |
| :-------- | :----- | :------: | :--------------------------------------- |
| `userId`  | string |    ✅    | The ID of the user whose image to delete. |

#### Responses

##### Response 200

Profile picture deleted successfully. Returns the updated user document.

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "username": "ahmed",
    "email": "ahmed@example.com",
    "role": "User",
    "isVerified": true,
    "postsCount": 3,
    "profilePicture": {
      "url": "",
      "publicId": null
    },
    "createdAt": "2026-07-20T18:27:31.000Z",
    "updatedAt": "2026-07-20T21:27:00.000Z"
  }
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 403

Forbidden. Insufficient permissions or attempting to modify the Super Admin (Owner) profile.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "You cannot delete profile picture"
  }
}
```

##### Response 404

User target profile was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "User not found"
  }
}
```

---

## Follow Feature

### PUT /users/:userId/follow 🔒

Toggle follow or unfollow another user. If the authenticated user is already following the target, the action will **unfollow** them; otherwise, it will **follow** them. A user cannot follow themselves.

#### Path Parameters

| Parameter | Type   | Required | Description                                  |
| :-------- | :----- | :------: | :------------------------------------------- |
| `userId`  | string |    ✅    | The ID of the user to follow or unfollow.    |

#### Responses

##### Response 200

Follow status toggled successfully.

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "message": "Followed successfully",
    "isFollowing": true
  }
}
```

> **Unfollow response** — when the user was already following the target:
> ```json
> {
>   "success": true,
>   "message": "Request processed successfully",
>   "data": {
>     "message": "Unfollowed successfully",
>     "isFollowing": false
>   }
> }
> ```

##### Response 400

User attempted to follow themselves.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "You cannot follow yourself"
  }
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 404

Target user was not found.

```json
{
  "message": "User not found"
}
```

---

### GET /users/:userId/followers 🔒

Retrieve the list of users who follow the specified user.

#### Path Parameters

| Parameter | Type   | Required | Description                                          |
| :-------- | :----- | :------: | :--------------------------------------------------- |
| `userId`  | string |    ✅    | The ID of the user whose followers list to retrieve. |

#### Responses

##### Response 200

Followers list retrieved successfully. Returns an array of user objects with basic profile info.

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012345",
      "fullName": "Ahmed Mohamed",
      "username": "ahmed",
      "profilePicture": {
        "url": "https://res.cloudinary.com/example/image/upload/profile.jpg",
        "publicId": "profile_picture_123"
      }
    }
  ]
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 404

User was not found.

```json
{
  "message": "User not found"
}
```

---

### GET /users/:userId/following 🔒

Retrieve the list of users that the specified user is following.

#### Path Parameters

| Parameter | Type   | Required | Description                                           |
| :-------- | :----- | :------: | :---------------------------------------------------- |
| `userId`  | string |    ✅    | The ID of the user whose following list to retrieve.  |

#### Responses

##### Response 200

Following list retrieved successfully. Returns an array of user objects with basic profile info.

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012345",
      "fullName": "Ahmed Mohamed",
      "username": "ahmed",
      "profilePicture": {
        "url": "https://res.cloudinary.com/example/image/upload/profile.jpg",
        "publicId": "profile_picture_123"
      }
    }
  ]
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 404

User was not found.

```json
{
  "message": "User not found"
}
```

---

## Block Feature

### GET /users/blocked-users 🔒

Retrieve the authenticated user's blocked users. Each entry includes the user's ID, name, username, job title, and profile picture.

#### Responses

##### Response 200

```json
{
  "success": true,
  "message": "Blocked users fetched successfully",
  "data": {
    "blockedUsers": [
      {
        "_id": "65f1a2b3c4d5e6f789012345",
        "fullName": "Ahmed Mohamed",
        "username": "ahmed",
        "jobTitle": "Full Stack Engineer",
        "profilePicture": {
          "url": "https://res.cloudinary.com/example/image/upload/profile.jpg",
          "publicId": "profile_picture_123"
        }
      }
    ]
  }
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 404

The authenticated user was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "User not found"
  }
}
```

---

### PATCH /users/:userId/block 🔒

Block the specified user. This also removes any follow relationship between both users and deletes notifications between them. Blocking does not restore follow relationships if the user is later unblocked.

#### Path Parameters

| Parameter | Type   | Required | Description                    |
| :-------- | :----- | :------: | :----------------------------- |
| `userId`  | string |    ✅    | The ID of the user to block.   |

#### Responses

##### Response 200

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "message": "User blocked successfully"
  }
}
```

##### Response 400

The user is already blocked.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "User is already blocked"
  }
}
```

##### Response 401

Not authorized.

##### Response 403

The authenticated user cannot block themselves.

##### Response 404

The target user or authenticated user was not found.

---

### PATCH /users/:userId/unblock 🔒

Remove the block placed by the authenticated user on the specified user. This does not restore any follow relationships that were removed when the block was created.

#### Path Parameters

| Parameter | Type   | Required | Description                      |
| :-------- | :----- | :------: | :------------------------------- |
| `userId`  | string |    ✅    | The ID of the user to unblock.  |

#### Responses

##### Response 200

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "message": "User unblocked successfully"
  }
}
```

##### Response 400

The target user is not currently blocked.

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "User is not blocked"
  }
}
```

##### Response 401

Not authorized.

##### Response 404

The target user or authenticated user was not found.

---

## Post Management Endpoints

### GET /posts 🔒

Retrieve a paginated list of blog posts. Populates comments and authors.

#### Query Parameters

| Parameter    | Type    | Required | Description                                |
| :----------- | :------ | :------: | :----------------------------------------- |
| `pageNumber` | integer |    ❌    | Page number to fetch (Min: 1, Default: 1). |

#### Responses

##### Response 200

List of posts returned successfully.

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012345",
      "title": "My First Blog Post",
      "user": {
        "_id": "65f1a2b3c4d5e6f789012347",
        "username": "Ahmed"
      },
      "postImage": {
        "url": "https://example.com/image.jpg",
        "publicId": "blog_image_123"
      },
      "likes": [
        {
          "_id": "65f1a2b3c4d5e6f789012348",
          "username": "Sara"
        }
      ],
      "comments": [],
      "sharesCount": 0,
      "postLikesCount": 1,
      "commentsCount": 0,
      "createdAt": "2026-07-20T18:27:29.000Z",
      "updatedAt": "2026-07-20T18:27:29.000Z"
    }
  ]
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

---

### POST /posts 🔒

Create a new blog post.

#### Request Body

| Field       | Type   | Required | Description                                                     |
| :---------- | :----- | :------: | :-------------------------------------------------------------- |
| `title`     | string |    ✅    | Title of the blog post (Min length: 2, Max length: 32).         |
| `postImage` | object |    ❌    | Nested image properties object containing `url` and `publicId`. |

#### Responses

##### Response 201

Post created successfully. Returns the populated post resource.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "title": "My First Blog Post",
    "user": {
      "_id": "65f1a2b3c4d5e6f789012347",
      "username": "Ahmed"
    },
    "postImage": {
      "url": "",
      "publicId": null
    },
    "likes": [],
    "comments": [],
    "sharesCount": 0,
    "postLikesCount": 0,
    "commentsCount": 0,
    "createdAt": "2026-07-20T18:27:29.000Z",
    "updatedAt": "2026-07-20T18:27:29.000Z"
  }
}
```

##### Response 400

Validation failure (e.g. description is too short).

```json
{
  "message": "String must contain at least 10 character(s)"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "Invalid token"
}
```

---

### GET /posts/:postId 🔒

Retrieve a single post details with all associated populated child structures.

#### Path Parameters

| Parameter | Type   | Required | Description                        |
| :-------- | :----- | :------: | :--------------------------------- |
| `postId`  | string |    ✅    | MongoDB ObjectId of the blog post. |

#### Responses

##### Response 200

Post retrieved successfully.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "title": "My First Blog Post",
    "user": {
      "_id": "65f1a2b3c4d5e6f789012347",
      "username": "Ahmed"
    },
    "postImage": {
      "url": "https://example.com/image.jpg",
      "publicId": "blog_image_123"
    },
    "likes": [],
    "comments": [],
    "sharesCount": 0,
    "postLikesCount": 0,
    "commentsCount": 0,
    "createdAt": "2026-07-20T18:27:29.000Z",
    "updatedAt": "2026-07-20T18:27:29.000Z"
  }
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 404

Post was not found in the database.

```json
{
  "message": "Post not found"
}
```

---

### PUT /posts/:postId 🔒

Update post parameters. Access is allowed only to the post author owner or Admins.

#### Path Parameters

| Parameter | Type   | Required | Description              |
| :-------- | :----- | :------: | :----------------------- |
| `postId`  | string |    ✅    | Post database record ID. |

#### Request Body

| Field       | Type   | Required | Description                      |
| :---------- | :----- | :------: | :------------------------------- |
| `title`     | string |    ❌    | Updated title (Min: 2, Max: 32). |
| `postImage` | object |    ❌    | Updated nested image object.     |

#### Responses

##### Response 200

Post updated successfully. Returns updated post document.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "title": "Updated Blog Post Title",
    "user": "65f1a2b3c4d5e6f789012347",
    "postImage": {
      "url": "https://example.com/image.jpg",
      "publicId": "blog_image_123"
    },
    "likes": [],
    "sharesCount": 0,
    "postLikesCount": 0,
    "commentsCount": 0,
    "createdAt": "2026-07-20T18:27:29.000Z",
    "updatedAt": "2026-07-20T21:28:00.000Z"
  }
}
```

##### Response 400

Zod payload validation error.

```json
{
  "message": "Invalid input"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "Invalid token"
}
```

##### Response 403

Forbidden. The user does not own this post and is not an Admin.

```json
{
  "message": "You are not allowed"
}
```

##### Response 404

Post was not found.

```json
{
  "message": "Post was not found"
}
```

---

### DELETE /posts/:postId 🔒

Delete a blog post and remove its media assets. Restricted to the post owner or Admins.

#### Path Parameters

| Parameter | Type   | Required | Description                     |
| :-------- | :----- | :------: | :------------------------------ |
| `postId`  | string |    ✅    | Database record ID of the post. |

#### Responses

##### Response 200

Post deleted successfully.

```json
{
  "success": true,
  "message": "Post has been deleted successfully"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 403

Forbidden. User has no ownership rights and is not an Admin.

```json
{
  "message": "You are not allowed"
}
```

##### Response 404

Post target was not found in the database.

```json
{
  "message": "Post was not found"
}
```

---

### PUT /posts/:postId/like 🔒

Toggle a user's like/unlike status on a specific post.

#### Path Parameters

| Parameter | Type   | Required | Description       |
| :-------- | :----- | :------: | :---------------- |
| `postId`  | string |    ✅    | The blog post ID. |

#### Responses

##### Response 200

Post liked status updated. Returns the updated post object showing the new likes array.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "title": "My First Blog Post",
    "user": "65f1a2b3c4d5e6f789012347",
    "postImage": {
      "url": "https://example.com/image.jpg",
      "publicId": "blog_image_123"
    },
    "likes": [
      {
        "_id": "65f1a2b3c4d5e6f789012347",
        "username": "Ahmed"
      }
    ],
    "sharesCount": 0,
    "postLikesCount": 1,
    "commentsCount": 0,
    "createdAt": "2026-07-20T18:27:29.000Z",
    "updatedAt": "2026-07-20T21:28:10.000Z"
  }
}
```

##### Response 401

Missing or invalid authentication token.

```json
{
  "message": "You are not logged in"
}
```

##### Response 404

Post was not found.

```json
{
  "message": "Post was not found"
}
```

---

### POST /posts/:postId/share 🔒

Share an existing blog post. Creates a new post record referencing the original post.

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| :-------- | :----- | :------: | :-------------------------------- |
| `postId`  | string |    ✅    | ID of the original post to share. |

#### Request Body

| Field         | Type   | Required | Description                                            |
| :------------ | :----- | :------: | :----------------------------------------------------- |
| `description` | string |    ❌    | Optional comment or text addition for the shared post. |

#### Responses

##### Response 201

Post shared successfully.

```json
{
  "success": true,
  "data": {
    "message": "Post shared successfully",
    "savedSharedPost": {
      "_id": "65f1a2b3c4d5e6f789012349",
      "title": "My First Blog Post",
      "user": "65f1a2b3c4d5e6f789012347",
      "postImage": {
        "url": "https://example.com/image.jpg",
        "publicId": "blog_image_123"
      },
      "likes": [],
      "sharedPost": "65f1a2b3c4d5e6f789012345",
      "sharesCount": 0,
      "postLikesCount": 0,
      "commentsCount": 0,
      "createdAt": "2026-07-23T08:30:00.000Z",
      "updatedAt": "2026-07-23T08:30:00.000Z"
    }
  }
}
```

##### Response 401

Missing or invalid authentication token.

```json
{
  "message": "Not authorized"
}
```

##### Response 404

Original post was not found.

```json
{
  "message": "Post was not found"
}
```

---

## Comment Management Endpoints

### GET /posts/:postId/comments 🔒

Retrieve a paginated list of comments associated with a specific blog post.

#### Path Parameters

| Parameter | Type   | Required | Description                    |
| :-------- | :----- | :------: | :----------------------------- |
| `postId`  | string |    ✅    | MongoDB ID of the parent post. |

#### Query Parameters

| Parameter         | Type    | Required | Description                                      |
| :---------------- | :------ | :------: | :----------------------------------------------- |
| `pageNumber`      | integer |    ❌    | Page index page parameter (Min: 1, Default: 1).  |
| `commentsPerPost` | integer |    ❌    | Number of comments loaded per page (Default: 5). |

#### Responses

##### Response 200

Comments retrieved successfully.

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012346",
      "postId": "65f1a2b3c4d5e6f789012345",
      "text": "This is a great post!",
      "user": {
        "_id": "65f1a2b3c4d5e6f789012347",
        "username": "Ahmed"
      },
      "commentImage": {
        "url": "https://res.cloudinary.com/example/image/upload/comment.jpg",
        "publicId": "comment_image_123"
      },
      "likes": [],
      "commentLikesCount": 0,
      "createdAt": "2026-07-20T18:27:27.000Z",
      "updatedAt": "2026-07-20T18:27:27.000Z"
    }
  ]
}
```

##### Response 400

Required path parameters missing.

```json
{
  "message": "Post ID is required"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

---

### POST /posts/:postId/comments 🔒

Create and post a new comment under a specific post.

#### Path Parameters

| Parameter | Type   | Required | Description         |
| :-------- | :----- | :------: | :------------------ |
| `postId`  | string |    ✅    | The ID of the post. |

#### Request Body

| Field          | Type   | Required | Description                        |
| :------------- | :----- | :------: | :--------------------------------- |
| `text`         | string |    ✅    | Text content of the comment.       |
| `commentImage` | object |    ❌    | Optional comment image attachment. |

#### Responses

##### Response 201

Comment created successfully. Returns the populated comment payload.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012346",
    "postId": "65f1a2b3c4d5e6f789012345",
    "text": "This is a great post!",
    "user": {
      "_id": "65f1a2b3c4d5e6f789012347",
      "username": "Ahmed"
    },
    "commentImage": {
      "url": "",
      "publicId": null
    },
    "likes": [],
    "commentLikesCount": 0,
    "createdAt": "2026-07-20T18:27:27.000Z",
    "updatedAt": "2026-07-20T18:27:27.000Z"
  }
}
```

##### Response 400

Invalid comment structure validation or missing path parameters.

```json
{
  "message": "Post ID is required"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "Invalid token"
}
```

---

### PUT /posts/:postId/comments/:commentId 🔒

Update the text body of an existing comment. Access restricted to comment author owner or Admins.

#### Path Parameters

| Parameter   | Type   | Required | Description                  |
| :---------- | :----- | :------: | :--------------------------- |
| `postId`    | string |    ✅    | ID of the parent post.       |
| `commentId` | string |    ✅    | ID of the comment to update. |

#### Request Body

| Field          | Type        | Required | Description                            |
| :------------- | :---------- | :------: | :------------------------------------- |
| `text`         | string      |    ❌    | Updated comment body text content.     |
| `commentImage` | binary file |    ❌    | Updated comment image file attachment. |

#### Responses

##### Response 200

Comment text updated successfully.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012346",
    "postId": "65f1a2b3c4d5e6f789012345",
    "text": "Updated comment text details",
    "user": {
      "_id": "65f1a2b3c4d5e6f789012347",
      "username": "Ahmed"
    },
    "commentImage": {
      "url": "https://res.cloudinary.com/example/image/upload/comment.jpg",
      "publicId": "comment_image_123"
    },
    "likes": [],
    "commentLikesCount": 0,
    "createdAt": "2026-07-20T18:27:27.000Z",
    "updatedAt": "2026-07-20T21:28:30.000Z"
  }
}
```

##### Response 400

Validation failure or comment ID missing.

```json
{
  "message": "Comment ID is required"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 403

Forbidden. Requesting user lacks ownership rights and is not an Admin.

```json
{
  "message": "You are not allowed"
}
```

##### Response 404

Comment not found in the database.

```json
{
  "message": "Comment was not found"
}
```

---

### DELETE /posts/:postId/comments/:commentId 🔒

Remove a comment. Access restricted to comment owner or Admins.

#### Path Parameters

| Parameter   | Type   | Required | Description              |
| :---------- | :----- | :------: | :----------------------- |
| `postId`    | string |    ✅    | Parent post ID.          |
| `commentId` | string |    ✅    | The comment database ID. |

#### Responses

##### Response 200

Comment deleted successfully.

```json
{
  "success": true,
  "message": "Comment has been deleted successfully"
}
```

##### Response 400

Comment identifier path parameter missing.

```json
{
  "message": "Comment ID is required"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "Invalid token"
}
```

##### Response 403

Forbidden. User lacks ownership rights and is not an Admin.

```json
{
  "message": "You are not allowed"
}
```

##### Response 404

Comment was not found.

```json
{
  "message": "Comment was not found"
}
```

---

### PUT /posts/:postId/comments/:commentId/like 🔒

Toggle user's like/unlike status on a specific comment.

#### Path Parameters

| Parameter   | Type   | Required | Description        |
| :---------- | :----- | :------: | :----------------- |
| `postId`    | string |    ✅    | Parent post ID.    |
| `commentId` | string |    ✅    | Target comment ID. |

#### Responses

##### Response 200

Comment like status updated successfully.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012346",
    "postId": "65f1a2b3c4d5e6f789012345",
    "text": "This is a great post!",
    "user": {
      "_id": "65f1a2b3c4d5e6f789012347",
      "username": "Ahmed"
    },
    "commentImage": {
      "url": "https://res.cloudinary.com/example/image/upload/comment.jpg",
      "publicId": "comment_image_123"
    },
    "likes": [
      {
        "_id": "65f1a2b3c4d5e6f789012347",
        "username": "Ahmed"
      }
    ],
    "commentLikesCount": 1,
    "createdAt": "2026-07-20T18:27:27.000Z",
    "updatedAt": "2026-07-20T21:28:40.000Z"
  }
}
```

##### Response 401

Missing or invalid authentication token.

```json
{
  "message": "You must be logged in to like this comment"
}
```

##### Response 404

Comment was not found.

```json
{
  "message": "Comment was not found"
}
```

---

### GET /posts/:postId/comments/:commentId/replies 🔒

Retrieve all replies for a specific parent comment.

#### Path Parameters

| Parameter   | Type   | Required | Description               |
| :---------- | :----- | :------: | :------------------------ |
| `postId`    | string |    ✅    | ID of the parent post.    |
| `commentId` | string |    ✅    | ID of the parent comment. |

#### Responses

##### Response 200

Replies retrieved successfully.

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012348",
      "parentComment": "65f1a2b3c4d5e6f789012346",
      "text": "This is a reply to the parent comment",
      "user": {
        "_id": "65f1a2b3c4d5e6f789012347",
        "username": "Ahmed",
        "profilePicture": {
          "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg",
          "publicId": "avatar_123"
        },
        "jobTitle": "Frontend Engineer"
      },
      "commentImage": {
        "url": "",
        "publicId": null
      },
      "likes": [],
      "replyLikesCount": 0,
      "replyCommentsCount": 0,
      "createdAt": "2026-07-25T21:00:00.000Z",
      "updatedAt": "2026-07-25T21:00:00.000Z"
    }
  ]
}
```

---

### POST /posts/:postId/comments/:commentId/replies 🔒

Post a new reply under a specific parent comment. Increments `replyCommentsCount` on the parent comment.

#### Path Parameters

| Parameter   | Type   | Required | Description                                |
| :---------- | :----- | :------: | :----------------------------------------- |
| `postId`    | string |    ✅    | ID of the parent post.                     |
| `commentId` | string |    ✅    | ID of the parent comment being replied to. |

#### Request Body

| Field        | Type        | Required | Description                           |
| :----------- | :---------- | :------: | :------------------------------------ |
| `text`       | string      |    ✅    | Reply comment text body.              |
| `replyImage` | binary file |    ❌    | Optional reply image attachment file. |

#### Responses

##### Response 201

Reply comment created successfully.

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f789012348",
    "postId": "65f1a2b3c4d5e6f789012345",
    "text": "This is a reply to the parent comment",
    "user": {
      "username": "Ahmed",
      "profilePicture": {
        "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg",
        "publicId": "avatar_123"
      },
      "jobTitle": "Frontend Engineer"
    },
    "parentComment": "65f1a2b3c4d5e6f789012346",
    "commentImage": {
      "url": "",
      "publicId": null
    },
    "replyLikesCount": 0,
    "replyCommentsCount": 0,
    "createdAt": "2026-07-25T21:00:00.000Z",
    "updatedAt": "2026-07-25T21:00:00.000Z"
  }
}
```

##### Response 400

Invalid Post ID or Parent Comment ID.

```json
{
  "success": false,
  "message": "Valid Parent Comment ID is required"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "No token provided"
}
```

##### Response 404

Parent comment was not found in this post.

```json
{
  "success": false,
  "message": "Parent comment was not found"
}
```

---

### PUT /posts/:postId/comments/:commentId/replies/:replyCommentId 🔒

Update the text body or image of an existing reply comment. Restricted to reply comment owner or Admins.

#### Path Parameters

| Parameter        | Type   | Required | Description                        |
| :--------------- | :----- | :------: | :--------------------------------- |
| `postId`         | string |    ✅    | ID of the parent post.             |
| `commentId`      | string |    ✅    | ID of the parent comment.          |
| `replyCommentId` | string |    ✅    | ID of the reply comment to update. |

#### Request Body

| Field        | Type        | Required | Description                          |
| :----------- | :---------- | :------: | :----------------------------------- |
| `text`       | string      |    ❌    | Updated text for the reply comment.  |
| `replyImage` | binary file |    ❌    | Updated reply image file attachment. |

#### Responses

##### Response 200

Reply comment updated successfully.

```json
{
  "success": true,
  "message": "Updated reply comment successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012348",
    "text": "Updated reply comment text content",
    "user": {
      "username": "Ahmed",
      "profilePicture": {
        "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg",
        "publicId": "avatar_123"
      },
      "jobTitle": "Frontend Engineer"
    }
  }
}
```

##### Response 400

Invalid IDs or input validation failed.

```json
{
  "success": false,
  "message": "Valid Reply Comment ID is required"
}
```

##### Response 401

Not authorized.

```json
{
  "message": "Invalid token"
}
```

##### Response 403

Forbidden. Requesting user lacks ownership rights.

```json
{
  "message": "You are not allowed"
}
```

##### Response 404

Reply comment was not found.

---

### DELETE /posts/:postId/comments/:commentId/replies/:replyCommentId 🔒

Delete a reply comment and decrement `replyCommentsCount` on its parent comment. Restricted to reply owner or Admins.

#### Path Parameters

| Parameter        | Type   | Required | Description                        |
| :--------------- | :----- | :------: | :--------------------------------- |
| `postId`         | string |    ✅    | ID of the parent post.             |
| `commentId`      | string |    ✅    | ID of the parent comment.          |
| `replyCommentId` | string |    ✅    | ID of the reply comment to delete. |

#### Responses

##### Response 200

Deleted reply comment successfully.

```json
{
  "success": true,
  "message": "Deleted reply comment successfully"
}
```

##### Response 400

Invalid ID parameters.

##### Response 401

Not authorized.

##### Response 403

Forbidden. User lacks ownership rights.

##### Response 404

Reply comment was not found.

````json
{
  "success": false,
  "message": "Reply comment was not found"
}
---

### PUT /posts/:postId/comments/:commentId/replies/:replyCommentId/like 🔒
Toggle like or unlike on a reply comment and update `replyLikesCount`.

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `postId` | string | ✅ | ID of the parent post. |
| `commentId` | string | ✅ | ID of the parent comment. |
| `replyCommentId` | string | ✅ | ID of the target reply comment. |

#### Responses

##### Response 200
Reply comment liked or unliked successfully.
```json
{
  "success": true,
  "message": "Reply comment liked successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012348",
    "replyLikesCount": 1,
    "likes": [
      {
        "username": "Ahmed",
        "profilePicture": {
          "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg"
        },
        "jobTitle": "Frontend Engineer"
      }
    ]
  }
}
````

##### Response 400

Invalid parent comment, post, or reply comment ID.

##### Response 401

Not authorized.

##### Response 404

Comment or reply comment was not found.

```json
{
  "success": false,
  "data": {
    "message": "Comment was not found"
  }
}
```

---

## Story Management Endpoints

Stories are available for 24 hours after creation. All story endpoints require authentication.

### GET /stories 🔒

Retrieve all stories created within the last 24 hours, newest first. Story authors and reaction users are returned with basic profile details.

#### Responses

##### Response 200

Stories retrieved successfully.

```json
{
  "success": true,
  "message": "Stories fetched successfully",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012345",
      "author": {
        "_id": "65f1a2b3c4d5e6f789012346",
        "username": "ahmed",
        "fullName": "Ahmed Mohamed",
        "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg", "publicId": "avatar_123" }
      },
      "title": "A beautiful day",
      "imageUrl": "https://res.cloudinary.com/example/image/upload/story.jpg",
      "fileUrl": "",
      "fileName": "",
      "views": [],
      "authorViewed": false,
      "reactions": [],
      "createdAt": "2026-10-03T12:00:00.000Z",
      "updatedAt": "2026-10-03T12:00:00.000Z"
    }
  ]
}
```

##### Response 401

Authentication is required.

```json
{
  "message": "No token provided"
}
```

### GET /stories/timeline 🔒

Retrieve stories from the authenticated user and users they follow, grouped by author. Stories in each group are ordered oldest first.

#### Responses

##### Response 200

Timeline stories retrieved successfully.

```json
{
  "success": true,
  "message": "Timeline stories fetched successfully",
  "data": [
    {
      "author": {
        "_id": "65f1a2b3c4d5e6f789012346",
        "username": "ahmed",
        "fullName": "Ahmed Mohamed",
        "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg", "publicId": "avatar_123" }
      },
      "stories": [
        {
          "_id": "65f1a2b3c4d5e6f789012345",
          "author": {
            "_id": "65f1a2b3c4d5e6f789012346",
            "username": "ahmed",
            "fullName": "Ahmed Mohamed",
            "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg", "publicId": "avatar_123" }
          },
          "title": "A beautiful day",
          "imageUrl": "https://res.cloudinary.com/example/image/upload/story.jpg",
          "fileUrl": "",
          "fileName": "",
          "views": [],
          "authorViewed": false,
          "reactions": [],
          "createdAt": "2026-10-03T12:00:00.000Z",
          "updatedAt": "2026-10-03T12:00:00.000Z"
        }
      ]
    }
  ]
}
```

##### Response 401

Authentication is required.

```json
{
  "message": "No token provided"
}
```

##### Response 404

The authenticated user was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "User was not found" }
}
```

### GET /stories/user/:userId 🔒

Retrieve stories created by the specified user within the last 24 hours. Access is denied if either user has blocked the other.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| ------------- | -------- | ------------ | --------------- |
| `userId` | string | ✅ | The ID of the user whose stories to retrieve. |

#### Responses

##### Response 200

User stories retrieved successfully. The `data` field contains the same story objects returned by `GET /stories`.

```json
{
  "success": true,
  "message": "User stories fetched successfully",
  "data": []
}
```

##### Response 400

The user ID is invalid.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "User ID is invalid" }
}
```

##### Response 403

The requested stories are not accessible because of a block relationship.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "You cannot access this user's stories" }
}
```

##### Response 404

The requested user was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "User was not found" }
}
```

### POST /stories 🔒

Create a text-only story or upload an image or video with an optional title. At least a title or file is required. Stories expire after 24 hours.

#### Request Body (`multipart/form-data`)

| **Field** | **Type** | **Required** | **Description** |
| --------- | -------- | ------------ | --------------- |
| `title` | string | ⚠️ | Story text (maximum 250 characters). Required if no file is uploaded; defaults to `Story` when a file is uploaded without a title. |
| `file` | file | ⚠️ | Optional image or video file (maximum 100 MiB). Other file types are rejected. |

At least one of `title` or `file` is required.

#### Responses

##### Response 201

Story created successfully.

```json
{
  "success": true,
  "message": "Story created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "author": {
      "_id": "65f1a2b3c4d5e6f789012346",
      "username": "ahmed",
      "fullName": "Ahmed Mohamed",
      "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg", "publicId": "avatar_123" }
    },
    "title": "A beautiful day",
    "imageUrl": "",
    "fileUrl": "",
    "fileName": "",
    "views": [],
    "authorViewed": false,
    "reactions": [],
    "createdAt": "2026-10-03T12:00:00.000Z",
    "updatedAt": "2026-10-03T12:00:00.000Z"
  }
}
```

##### Response 400

Neither a title nor a file was provided, or the uploaded file is not an image or video.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "A story title or image/video is required" }
}
```

### DELETE /stories/:storyId 🔒

Delete a story owned by the authenticated user.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| ------------- | -------- | ------------ | --------------- |
| `storyId` | string | ✅ | The ID of the story to delete. |

#### Responses

##### Response 200

Story deleted successfully.

```json
{
  "success": true,
  "message": "Story deleted successfully",
  "data": null
}
```

##### Response 403

Only the story owner can delete the story.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "You are not authorized to delete this story" }
}
```

##### Response 400

The story ID is invalid or missing.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story ID is required" }
}
```

##### Response 404

The story was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story was not found" }
}
```

### PUT /stories/:storyId/view 🔒

Record the authenticated user as a viewer. When the story owner views their own story, `authorViewed` is set to `true` instead of adding them to `views`.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| ------------- | -------- | ------------ | --------------- |
| `storyId` | string | ✅ | The ID of the story to mark as viewed. |

#### Responses

##### Response 200

Story viewed successfully. Returns the updated story.

```json
{
  "success": true,
  "message": "Story viewed successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "author": {
      "_id": "65f1a2b3c4d5e6f789012346",
      "username": "ahmed",
      "fullName": "Ahmed Mohamed",
      "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg", "publicId": "avatar_123" }
    },
    "title": "A beautiful day",
    "imageUrl": "https://res.cloudinary.com/example/image/upload/story.jpg",
    "fileUrl": "",
    "fileName": "",
    "views": ["65f1a2b3c4d5e6f789012347"],
    "authorViewed": false,
    "reactions": [],
    "createdAt": "2026-10-03T12:00:00.000Z",
    "updatedAt": "2026-10-03T12:00:00.000Z"
  }
}
```

##### Response 400

The story ID is invalid or missing.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story ID is required" }
}
```

##### Response 404

The story was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story was not found" }
}
```

### GET /stories/:storyId/viewers 🔒

Retrieve the users who viewed a story. Only the story owner can access the viewer list; the owner is excluded from the results.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| ------------- | -------- | ------------ | --------------- |
| `storyId` | string | ✅ | The ID of the story whose viewers to retrieve. |

#### Responses

##### Response 200

Viewers fetched successfully.

```json
{
  "success": true,
  "message": "Viewers fetched successfully",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012347",
      "username": "sara",
      "fullName": "Sara Ali",
      "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/sara.jpg", "publicId": "sara_123" }
    }
  ]
}
```

##### Response 403

Only the story owner can view the viewer list.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "You are not authorized to view this story's viewers" }
}
```

##### Response 400

The story ID is invalid or missing.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story ID is required" }
}
```

##### Response 404

The story was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story was not found" }
}
```

### POST /stories/:storyId/reply 🔒

Add a text reply from the authenticated user to a story.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| ------------- | -------- | ------------ | --------------- |
| `storyId` | string | ✅ | The ID of the story to reply to. |

#### Request Body (`application/json`)

| **Field** | **Type** | **Required** | **Description** |
| --------- | -------- | ------------ | --------------- |
| `message` | string | ✅ | Text of the reply. |

#### Responses

##### Response 200

Story replied successfully. The returned story includes the new reply in `replies`.

```json
{
  "success": true,
  "message": "Story replied successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "author": {
      "_id": "65f1a2b3c4d5e6f789012346",
      "username": "ahmed",
      "fullName": "Ahmed Mohamed",
      "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg", "publicId": "avatar_123" }
    },
    "title": "A beautiful day",
    "imageUrl": "https://res.cloudinary.com/example/image/upload/story.jpg",
    "fileUrl": "",
    "fileName": "",
    "views": [],
    "replies": [
      {
        "user": "65f1a2b3c4d5e6f789012347",
        "message": "This looks amazing!"
      }
    ],
    "authorViewed": false,
    "reactions": [],
    "createdAt": "2026-10-03T12:00:00.000Z",
    "updatedAt": "2026-10-03T12:00:00.000Z"
  }
}
```

##### Response 400

The story ID or reply message is invalid or missing.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story ID and message are required" }
}
```

##### Response 401

Authentication is required.

```json
{
  "message": "No token provided"
}
```

##### Response 404

The story was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story was not found" }
}
```

### PATCH /stories/:storyId/react 🔒

Add or change the authenticated user's reaction. Sending the same reaction type again removes it.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| ------------- | -------- | ------------ | --------------- |
| `storyId` | string | ✅ | The ID of the story to react to. |

#### Request Body (`application/json`)

| **Field** | **Type** | **Required** | **Description** |
| --------- | -------- | ------------ | --------------- |
| `type` | string | ✅ | Reaction value, such as `❤️`. Sending the same value again removes the reaction. |

#### Responses

##### Response 200

Story reaction updated successfully. Returns the updated story.

```json
{
  "success": true,
  "message": "Story reaction updated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "author": {
      "_id": "65f1a2b3c4d5e6f789012346",
      "username": "ahmed",
      "fullName": "Ahmed Mohamed",
      "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg", "publicId": "avatar_123" }
    },
    "title": "A beautiful day",
    "imageUrl": "https://res.cloudinary.com/example/image/upload/story.jpg",
    "fileUrl": "",
    "fileName": "",
    "views": [],
    "authorViewed": false,
    "reactions": [
      {
        "user": {
          "_id": "65f1a2b3c4d5e6f789012347",
          "username": "sara",
          "fullName": "Sara Ali",
          "profilePicture": { "url": "https://res.cloudinary.com/example/image/upload/sara.jpg", "publicId": "sara_123" }
        },
        "type": "❤️"
      }
    ],
    "createdAt": "2026-10-03T12:00:00.000Z",
    "updatedAt": "2026-10-03T12:00:00.000Z"
  }
}
```

##### Response 400

The story ID or reaction type is invalid or missing.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story ID and reaction type are required" }
}
```

##### Response 404

The story was not found.

```json
{
  "success": false,
  "message": "Request failed",
  "data": { "message": "Story was not found" }
}
```

---

## Notification Management Endpoints

### GET /notifications 🔒
Retrieve the latest 30 notifications for the authenticated user, sorted in descending order (newest first), with populated sender user details.

#### Responses

##### Response 200
Notifications retrieved successfully.
```json
{
  "success": true,
  "message": "Request succeed",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f789012345",
      "recipient": "65f1a2b3c4d5e6f789012340",
      "sender": {
        "_id": "65f1a2b3c4d5e6f789012341",
        "fullName": "Ahmed Mohamed",
        "username": "ahmed",
        "profilePicture": {
          "url": "https://res.cloudinary.com/example/image/upload/avatar.jpg",
          "publicId": "avatar_123"
        }
      },
      "type": "like",
      "post": "65f1a2b3c4d5e6f789012342",
      "comment": "65f1a2b3c4d5e6f789012343",
      "reply": "65f1a2b3c4d5e6f789012344",
      "isRead": false,
      "createdAt": "2026-09-27T12:00:00.000Z",
      "updatedAt": "2026-09-27T12:00:00.000Z"
    }
  ]
}
```

##### Response 401
Not authorized.

---

### PATCH /notifications 🔒
Mark all notifications as read for the authenticated user (`isRead: true`).

#### Responses

##### Response 200
All notifications marked as read successfully.
```json
{
  "success": true,
  "message": "Request succeed",
  "data": {
    "acknowledged": true,
    "modifiedCount": 5,
    "upsertedId": null,
    "upsertedCount": 0,
    "matchedCount": 5
  }
}
```

##### Response 401
Not authorized.

---

### PATCH /notifications/:notificationId 🔒
Mark a specific notification as read by ID (`isRead: true`). Only the recipient of the notification can mark it as read.

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `notificationId` | string | ✅ | ID of the notification to mark as read. |

#### Responses

##### Response 200
Notification marked as read successfully.
```json
{
  "success": true,
  "message": "Request succeed",
  "data": {
    "_id": "65f1a2b3c4d5e6f789012345",
    "recipient": "65f1a2b3c4d5e6f789012340",
    "sender": "65f1a2b3c4d5e6f789012341",
    "type": "like",
    "post": "65f1a2b3c4d5e6f789012342",
    "comment": "65f1a2b3c4d5e6f789012343",
    "reply": "65f1a2b3c4d5e6f789012344",
    "isRead": true,
    "createdAt": "2026-09-27T12:00:00.000Z",
    "updatedAt": "2026-09-27T12:05:00.000Z"
  }
}
```

##### Response 401
Not authorized.

##### Response 404
Notification was not found.
```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "message": "Notification not found"
  }
}
```

---

## Chat Management Endpoints

All chat endpoints require a valid access token in the Authorization header. Multipart uploads are limited to 100 MiB.

Chat errors use this response format:

    {
      "success": false,
      "message": "Request failed",
      "data": { "message": "Description of the error" }
    }

### GET /chat/conversations 🔒

Get conversations ordered by the latest message. Each entry includes the chat partner, last message, and unread count.

#### Responses

##### Response 200

Conversations retrieved successfully.

    {
      "success": true,
      "data": []
    }

##### Response 401

The access token is missing or invalid.

### POST /chat/:recipientId/send 🔒

Send a text message, attachment, or both. Use JSON for text-only messages or multipart/form-data for attachments. Images populate imageUrl; other files populate fileUrl and fileName.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| recipientId | string | ✅ | MongoDB ObjectId of the recipient. |

#### Request Body

Content-Type: application/json or multipart/form-data. Multipart file field: file.

| **Field** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| message | string | No* | Message text. Required when no file is supplied. |
| file | file | No* | Image or other file, up to 100 MiB. Required when message is empty. |

#### Responses

##### Response 201

Message sent successfully.

    {
      "success": true,
      "message": "Message sent successfully",
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "message": "Hello",
        "isPinned": false,
        "isStarred": false
      }
    }

##### Response 400

Message or file is required.

##### Response 401

The access token is missing or invalid.

##### Response 403

The recipient or sender has blocked the other user.

##### Response 500

Message persistence or attachment upload failed.

### POST /chat/:recipientId/audio 🔒

Upload and send a voice message. An optional replyTo associates it with an existing message.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| recipientId | string | ✅ | MongoDB ObjectId of the recipient. |

#### Request Body

Content-Type: multipart/form-data.

| **Field** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| audio | file | ✅ | Recorded audio file, up to 100 MiB. |
| replyTo | string | No | MongoDB ObjectId of the message being replied to. |

#### Responses

##### Response 201

Audio message sent successfully.

    {
      "success": true,
      "message": "Audio message sent successfully",
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "audioUrl": "https://example.com/voice.webm"
      }
    }

##### Response 403

The recipient or sender has blocked the other user.

##### Response 404

Audio file is missing or the reply target was not found.

##### Response 500

Cloud media upload failed.

##### Response 401

The access token is missing or invalid.

### POST /chat/:recipientId/:messageId/reply 🔒

Reply to a message with text, an attachment, or both. Images populate imageUrl; other files populate fileUrl and fileName.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| recipientId | string | ✅ | MongoDB ObjectId of the recipient. |
| messageId | string | ✅ | MongoDB ObjectId of the message being replied to. |

#### Request Body

Content-Type: multipart/form-data. File field: file.

| **Field** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| message | string | No* | Reply text. Required when no file is supplied. |
| file | file | No* | Image or other file, up to 100 MiB. Required when message is empty. |

#### Responses

##### Response 201

Reply created successfully.

    {
      "success": true,
      "message": "Reply sent successfully",
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "message": "Reply text",
        "replyTo": "65f1a2b3c4d5e6f789012398"
      }
    }

##### Response 400

Recipient or reply content is missing.

##### Response 403

The recipient or sender has blocked the other user.

##### Response 404

The original message was not found.

##### Response 500

Attachment upload failed.

##### Response 401

The access token is missing or invalid.

### POST /chat/:recipientId/:messageId/forward 🔒

Forward an existing message to another user. The new message copies the original content and sets isForwarded to true.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| recipientId | string | ✅ | MongoDB ObjectId of the new recipient. |
| messageId | string | ✅ | MongoDB ObjectId of the message to forward. |

#### Responses

##### Response 201

Forwarded message created successfully.

    {
      "success": true,
      "message": "Request succeed",
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "isForwarded": true
      }
    }

##### Response 403

The recipient or sender has blocked the other user.

##### Response 404

The original message was not found.

##### Response 401

The access token is missing or invalid.

### GET /chat/:userId 🔒

Get the conversation history, ordered oldest first. Incoming unread messages are marked as read.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| userId | string | ✅ | Conversation partner's MongoDB ObjectId. |

#### Responses

##### Response 200

Messages retrieved successfully. Sender, recipient, reactions, and reply target are populated.

    {
      "success": true,
      "count": 1,
      "data": [
        {
          "_id": "65f1a2b3c4d5e6f789012399",
          "message": "Hello",
          "isPinned": false,
          "isStarred": false,
          "createdAt": "2026-09-29T14:30:00.000Z"
        }
      ]
    }

##### Response 400

userId is missing or invalid.

##### Response 401

The access token is missing or invalid.

### PATCH /chat/:userId/read 🔒

Mark unread incoming messages from userId as read.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| userId | string | ✅ | Conversation partner's MongoDB ObjectId. |

#### Responses

##### Response 200

Messages marked as read.

    {
      "success": true,
      "message": "Messages marked as read"
    }

##### Response 400

userId is missing or invalid.

##### Response 401

The access token is missing or invalid.

### GET /chat/:userId/pinned 🔒

List pinned messages in the conversation, newest first. Pin state is shared by both participants.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| userId | string | ✅ | Conversation partner's MongoDB ObjectId. |

#### Responses

##### Response 200

Pinned messages retrieved successfully.

    {
      "success": true,
      "message": "Request Succeed",
      "data": {
        "message": "Pinned messages of the user",
        "data": []
      }
    }

##### Response 400

userId is missing.

##### Response 401

The access token is missing or invalid.

### GET /chat/:userId/starred 🔒

List starred messages in the conversation, newest first. Star state is shared by both participants.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| userId | string | ✅ | Conversation partner's MongoDB ObjectId. |

#### Responses

##### Response 200

Starred messages retrieved successfully.

    {
      "success": true,
      "message": "Request succeed",
      "data": {
        "message": "Starred messages of the user",
        "data": []
      }
    }

##### Response 400

userId is missing.

##### Response 401

The access token is missing or invalid.

### PATCH /chat/:messageId/react 🔒

Add or change a reaction. Sending the same reaction again removes it. Supported values are like, love, care, haha, wow, sad, angry, and eggs.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| messageId | string | ✅ | MongoDB ObjectId of the message. |

#### Request Body

Content-Type: application/json.

| **Field** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| reactionType | string | ✅ | Reaction identifier, such as love. |

#### Responses

##### Response 200

Reaction updated successfully.

    {
      "success": true,
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "reactions": []
      }
    }

##### Response 400

messageId or reactionType is missing.

##### Response 403

The authenticated user is not part of the conversation.

##### Response 404

The message was not found.

##### Response 401

The access token is missing or invalid.

### PATCH /chat/:messageId/pin 🔒

Toggle the shared pin state. Either participant can pin or unpin the message. No request body is required.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| messageId | string | ✅ | MongoDB ObjectId of the message. |

#### Responses

##### Response 200

Pin state toggled successfully.

    {
      "success": true,
      "message": "Request succeed",
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "isPinned": true
      }
    }

##### Response 400

messageId is missing.

##### Response 401

The access token is missing or invalid.

##### Response 403

The authenticated user is not part of the conversation.

##### Response 404

The message was not found.

### PATCH /chat/:messageId/star 🔒

Toggle the shared star state. Either participant can star or unstar the message. No request body is required.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| messageId | string | ✅ | MongoDB ObjectId of the message. |

#### Responses

##### Response 200

Star state toggled successfully.

    {
      "success": true,
      "message": "Request succeed",
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "isStarred": true
      }
    }

##### Response 400

messageId is missing.

##### Response 401

The access token is missing or invalid.

##### Response 403

The authenticated user is not part of the conversation.

##### Response 404

The message was not found.

### PATCH /chat/:messageId 🔒

Edit a text message. Attachments cannot be edited through this endpoint.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| messageId | string | ✅ | MongoDB ObjectId of the message. |

#### Request Body

Content-Type: application/json.

| **Field** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| message | string | ✅ | Updated message text. |

#### Responses

##### Response 200

Message edited successfully.

    {
      "success": true,
      "data": {
        "_id": "65f1a2b3c4d5e6f789012399",
        "message": "Updated message text"
      }
    }

##### Response 403

Only the sender may edit the message.

##### Response 404

The message was not found or the new message is empty.

##### Response 401

The access token is missing or invalid.

### DELETE /chat/:messageId 🔒

Soft-delete a message sent by the authenticated user. Message content and attachments are cleared.

#### Path Parameters

| **Parameter** | **Type** | **Required** | **Description** |
| --- | --- | --- | --- |
| messageId | string | ✅ | MongoDB ObjectId of the message. |

#### Responses

##### Response 200

Message deleted successfully.

    {
      "success": true,
      "message": "Message deleted successfully"
    }

##### Response 403

Only the sender may delete the message.

##### Response 404

The message was not found.

##### Response 401

The access token is missing or invalid.

---
## Common HTTP Status Codes

| Code  | Status Text           | Description in Context                                                         |
| :---- | :-------------------- | :----------------------------------------------------------------------------- |
| `200` | OK                    | The request succeeded, and the payload is returned in the response.            |
| `201` | Created               | The resource (post/comment) was successfully created.                          |
| `400` | Bad Request           | The request parameters are invalid or missing, or fail Zod validation rules.   |
| `401` | Unauthorized          | The request lacks a valid JWT token in the Authorization header.               |
| `403` | Forbidden             | The authenticated user lacks the required ownership permissions or Admin flag. |
| `404` | Not Found             | The requested route, user, post, or comment could not be found.                |
| `500` | Internal Server Error | An unexpected server error occurred during database access or media upload.     |
