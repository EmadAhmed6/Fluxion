# 🎨 Fluxion Frontend — Technical Platform Client

> The client-side application for the **Fluxion** social media and technical engineering platform, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **TanStack React Query (v5)**, and **Tailwind CSS**.

---

## 🚀 Overview

The **Fluxion Frontend** delivers an intuitive user experience with visual excellence, micro-interactions, responsive design, and modular feature architecture. It offers real-time client-side data caching, single atomic multipart uploads, rich tooltips, nested comments with inline replies, and dedicated administrative management tools.

---

## 📦 Architecture & Key Features

### 1. Domain-Driven Feature Architecture (`_features/`)
Code is organized into domain feature modules rather than generic file-type folders:

```
frontend/
└── _features/
    ├── auth/
    │   ├── api/          # Auth endpoints (login, register, getAuthMe, verifyOtp, etc.)
    │   ├── hooks/        # Dedicated hooks (useLoginMutation, useGetAuthMeQuery)
    │   ├── schemas/      # Zod validation schemas (loginSchema, registerSchema)
    │   └── types/        # Auth interfaces
    ├── posts/
    │   ├── api/          # Posts, comments, replies API handlers
    │   ├── hooks/        # React Query hooks (useGetPosts, useLikePost, useAddReply, etc.)
    │   ├── schemas/      # Post, comment, & edit profile Zod schemas
    │   └── types/        # Post, Comment, & Reply interfaces
    └── user/
        ├── api/          # User profile API requests (getUserProfile, updateUser, changePassword, uploadAvatar)
        ├── hooks/        # User profile hooks (useGetUserProfile, useUpdateUser, useChangePassword)
        ├── schema/       # User feature Zod schemas (changePasswordSchema)
        └── types/        # UserProfile interfaces
```

---

### 2. Single Atomic Multipart Upload Pipeline
All image updates and text updates (posts, comments, and replies) are sent atomically in a single `Multipart/FormData` HTTP request:
- Prevents UI image flickering or temporary reversion during state updates.
- Eliminates premature toast alerts before file uploads finish on Cloudinary.
- Automatically handles image removal or replacement.

---

### 3. TanStack React Query Cache Invalidation Engine
All post, comment, reply, and profile mutations trigger targeted invalidation across all key query scopes:
- `["posts"]`: Main feed posts
- `["post", postId]`: Single post view
- `["userProfile", userId]`: User profile details & post history
- `["users"]`: All users list (admin dashboard table & user dropdowns)
- `["authMe"]`: Current authenticated user session

---

### 4. Interactive Hover Cards & Reaction Popovers
- **`<UserHoverCard />`**: Hovering over author links (post author, comment author, reply author, or table rows) opens an interactive popover showing avatar, username, role badges (👑 OWNER, 🛡️ Admin, or User), clickable profile link (`/profile/${userId}`), and administrative actions (**Set as Admin / Remove Admin** for Super Admin, and **Edit User** for Admins on non-SuperAdmin targets).
- **`<UserListTooltip />`**: Hovering over like or share buttons displays a popover list of users who reacted (featuring avatars and usernames).
- **`<AuthorProfileTooltip />`**: Displays comprehensive profile details in Admin Dashboard tables.

---

### 5. Unified Typography System (`@/_components/Text.tsx`)
All text elements (`h1`-`h3`, `p`, `span`, `label`) use a unified design component:

```tsx
import { Text } from "@/_components/Text";

<Text
  as="h1" | "h2" | "h3" | "p" | "span" | "label"
  size="xs" | "sm" | "default" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  font="default" | "medium" | "semiBold" | "bold" | "extraBold" | "black"
  color="primary" | "secondary" | "white" | "black" | "muted" | "error" | "warning"
>
  Content Goes Here
</Text>
```

---

### 6. Admin Dashboard & Multi-Tiered Access Privileges
Dedicated administrative routes guarded for `isAdmin` and `isSuperAdmin` users:
- **`/admin/dashboard/users`**: Manage registered user accounts, filter by role (All/Admins/Users), search by username/email/jobTitle, edit user profiles, toggle admin status (Super Admin only), and delete accounts. Super Admins are sorted at the top of the table automatically. Regular admins cannot edit or delete Super Admin profiles or toggle admin statuses.
- **`/admin/dashboard/posts`**: Manage published articles, inspect engagement counts, search articles, and delete posts.
- **Admin Profile Editing**: Admins can edit user profile details and change profile photos directly from profile pages or hover cards, with protection for Super Admin (Owner) profiles.

---

### 7. GitHub OAuth 2.0 Authorization & OAuth Safeguards
- **GitHub OAuth Redirect & Callback Route (`/auth/callback`)**: Clicking "Continue with GitHub" redirects to `${NEXT_PUBLIC_API_URL}/auth/github`. The dedicated client callback route (`app/auth/callback/page.tsx`) receives the `token` parameter from URL, saves it to browser cookies (`Cookies.set("token", token)`), invalidates React Query `authMe` cache (`queryClient.invalidateQueries({ queryKey: ["authMe"] })`), displays success toast, and navigates to the home feed.
- **Email or Username Login Flexibility**: Login form accepts either an email address or username in a single input field. The auth client (`_features/auth/api/login.ts`) automatically formats the request payload (`email` if input contains `@`, or `username` if not).
- **OAuth Account Safeguards**:
  - Email editing in `EditProfileModal` is disabled for OAuth accounts (`user.provider !== "local"`), accompanied by an explanatory notification.
  - The "Change Password" button and `ChangePasswordModal` are hidden on profile pages for OAuth accounts (`!user.provider || user.provider === "local"`), reflecting server-side restrictions.

---

### 8. Account Security & Change Password Modal
- **Strict Owner-Only Access (`isOwnProfile`)**: The "Change Password" action button and modal are strictly restricted to local account owners viewing their own profile (`isOwnProfile === true` & `provider === "local"`). Neither Admins nor Super Admins can view or trigger password changes for other users.
- **Client-Side Zod Validation (`changePasswordSchema`)**: Form validated with real-time requirements checking: minimum 6 characters, maximum 72 characters, at least one uppercase letter (`A-Z`), one lowercase letter (`a-z`), one digit (`0-9`), and matching confirmation password field.
- **Interactive UI**: Modal built with React Hook Form + Zod resolver (`ChangePasswordModal.tsx`), live requirement checkmarks, and custom toast notifications.

---

### 9. Automatic Token Refresh & Session Interceptors
- **Axios Client Interceptor (`lib/axiosClient.ts`)**: Configured with `withCredentials: true` to send and receive secure `httpOnly` refresh cookies across domains.
- **Background Token Refresh on 401 Unauthorized**: Intercepts expired Access Token errors automatically, calls `POST /auth/refresh-token` with credentials, retrieves a new Access Token, updates the `token` cookie (`Cookies.set("token", newAccessToken)`), and silently retries queued pending requests without user interruption.
- **Server-Side Session Invalidation**: `useLogout` hook sends `POST /auth/logout` to clear the `httpOnly` cookie on the server before removing local client tokens and redirecting to `/auth/login`.

---

## 🛠️ Tech Stack

| Dependency | Purpose |
| :--- | :--- |
| **Next.js 16** | App Router framework, SSR, dynamic routing |
| **React 19** | Modern UI rendering engine |
| **TypeScript** | Type safety across components, props, and API interfaces |
| **TanStack React Query (v5)** | Server state management, caching, optimistic updates |
| **Tailwind CSS v4** | Styling, glassmorphism, responsive utilities |
| **Lucide React** | Icon system |
| **Zod & React Hook Form** | Form management & client-side schema validation |

---

## 🏃 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Verify TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```
