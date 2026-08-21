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
- **Error Responses**: Return a standard error JSON object with a `message` field describing the issue (and optional `success: false`).
  ```json
  {
    "message": "Error details and description go here"
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
| 10  | GET    | `/users`                                                          | Retrieve list of all users                                       |  🔒  | 🔒 100 req/15min |
| 11  | GET    | `/users/:userId`                                                  | Retrieve detailed user profile                                   |  🔒  | 🔒 100 req/15min |
| 12  | PUT    | `/users/:userId`                                                  | Update profile details, jobTitle, bio, avatar (OAuth restricted) |  🔒  | 🔒 100 req/15min |
| 13  | PATCH  | `/users/:userId/toggle-admin`                                     | Toggle user Admin role status (Super Admin Only)                 |  🔒  | 🔒 100 req/15min |
| 14  | POST   | `/users/:userId/change-password`                                  | Change account password (Local Auth Owners Only)                 |  🔒  |  🔒 10 req/min   |
| 15  | DELETE | `/users/:userId`                                                  | Delete user account from the database                            |  🔒  | 🔒 100 req/15min |
| 14  | GET    | `/posts`                                                          | Retrieve all blog posts with populated user, likes, and shares   |  🔒  | 🔒 100 req/15min |
| 15  | POST   | `/posts`                                                          | Create a new blog post with postImage metadata                   |  🔒  | 🔒 100 req/15min |
| 16  | POST   | `/posts/:postId/share`                                            | Share an existing post & update shares count                     |  🔒  | 🔒 100 req/15min |
| 17  | GET    | `/posts/:postId`                                                  | Retrieve detailed view of a single post by ID                    |  🔒  | 🔒 100 req/15min |
| 18  | PUT    | `/posts/:postId`                                                  | Update title, description, category, or postImage of a post      |  🔒  | 🔒 100 req/15min |
| 19  | DELETE | `/posts/:postId`                                                  | Delete a post and clear its associated media                     |  🔒  | 🔒 100 req/15min |
| 20  | PUT    | `/posts/:postId/like`                                             | Toggle like/unlike status on a blog post                         |  🔒  | 🔒 100 req/15min |
| 21  | GET    | `/posts/:postId/comments`                                         | Retrieve comments for a post                                     |  🔒  | 🔒 100 req/15min |
| 22  | POST   | `/posts/:postId/comments`                                         | Post a new comment (with optional commentImage)                  |  🔒  | 🔒 100 req/15min |
| 23  | PUT    | `/posts/:postId/comments/:commentId/like`                         | Toggle like/unlike on a comment                                  |  🔒  | 🔒 100 req/15min |
| 24  | PUT    | `/posts/:postId/comments/:commentId`                              | Update text or commentImage of a comment                         |  🔒  | 🔒 100 req/15min |
| 25  | DELETE | `/posts/:postId/comments/:commentId`                              | Remove comment & decrement commentsCount on post                 |  🔒  | 🔒 100 req/15min |
| 26  | GET    | `/posts/:postId/comments/:commentId/replies`                      | Get all replies for a parent comment                             |  🔒  | 🔒 100 req/15min |
| 27  | POST   | `/posts/:postId/comments/:commentId/replies`                      | Create a reply under a parent comment (with optional replyImage) |  🔒  | 🔒 100 req/15min |
| 28  | PUT    | `/posts/:postId/comments/:commentId/replies/:replyCommentId`      | Update text content or replyImage of a reply comment             |  🔒  | 🔒 100 req/15min |
| 29  | DELETE | `/posts/:postId/comments/:commentId/replies/:replyCommentId`      | Remove reply comment & decrement replyCommentsCount              |  🔒  | 🔒 100 req/15min |
| 30  | PUT    | `/posts/:postId/comments/:commentId/replies/:replyCommentId/like` | Toggle like/unlike on a reply comment                            |  🔒  | 🔒 100 req/15min |

---

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Post Management Endpoints](#post-management-endpoints)
- [Comment Management Endpoints](#comment-management-endpoints)
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

## Common HTTP Status Codes

| Code  | Status Text           | Description in Context                                                         |
| :---- | :-------------------- | :----------------------------------------------------------------------------- |
| `200` | OK                    | The request succeeded, and the payload is returned in the response.            |
| `201` | Created               | The resource (post/comment) was successfully created.                          |
| `400` | Bad Request           | The request parameters are invalid or missing, or fail Zod validation rules.   |
| `401` | Unauthorized          | The request lacks a valid JWT token in the Authorization header.               |
| `403` | Forbidden             | The authenticated user lacks the required ownership permissions or Admin flag. |
| `404` | Not Found             | The requested route, user, post, or comment could not be found.                |
| `500` | Internal Server Error | An unexpected server error occurred during database access or image upload.    |
