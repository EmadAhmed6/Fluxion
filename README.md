⚡ Fluxion — Modern Engineering Social Media Platform
A full-stack engineering social platform and technical blogging suite built with Next.js 16 (App Router), React 19, TypeScript, Express.js, MongoDB (Mongoose), TanStack React Query (v5), Cloudinary, and Tailwind CSS.

🌟 Overview
Fluxion is a sleek, high-contrast, dual-language-capable social platform engineered for developers and tech professionals. It provides a real-time interactive user experience with atomic multipart image uploads, nested comment & inline reply threads, interactive user hover cards, reaction popovers, profile bio management, and administrative dashboards.

🚀 Key Features
💻 Client Side (Frontend)
⚡ Next.js 16 App Router & React 19: Powered by client/server components, SSR, and dynamic route optimization.
🎨 Glassmorphism & High-Contrast Design: Tailored theme palette with dark mode support, smooth micro-interactions, and custom typography system (<Text />).
**👑 Multi-Tiered Role System (Super Admin - 🐙 GitHub OAuth 2.0 Integration & Dual Login: Supports authentication via traditional credentials (either Email Address or Username) OR 1-click GitHub OAuth. Automated Passport session handling, JWT generation, dedicated Next.js client callback route (/auth/callback), and instant React Query cache invalidation (queryClient.invalidateQueries({ queryKey: ["authMe"] })).
🔒 Provider-Based Account Safeguards: Strict server-side and client-side protections for social login accounts (provider: "github"). Disables email & password editing in EditProfileModal, hides Change Password options on profile pages, and returns 403 Forbidden on backend credential modification attempts.
👑 Multi-Tiered Role System (Super Admin / Admin / User):
Super Admin (OWNER): Dynamic database-driven role (isSuperAdmin) with top priority sorting, distinct golden 👑 OWNER badge with Egyptian Arabic localized translations (صاحب الموقع), exclusive ability to promote/demote admins, and immunity from deletion/editing by regular admins.
Admin: Has administrative access to dashboard and user editing, with custom 🛡️ Admin badge (أدمن).
User: Standard user role.
🔄 Single Atomic Multipart Uploads: Text and image uploads (postImage, commentImage, replyImage) are processed in single atomic FormData HTTP requests to eliminate image flickering and premature toasts.
💬 Nested Comments & Inline Replies: Real-time comment threads supporting multi-level replies (ReplySection), inline editing, image attachments, and likes.
🗂️ React Query Cache Strategy: Instant UI updates across Feed, Single Post Pages, Profile Pages, and Admin Dashboard via global cache invalidation (["posts"], ["post", postId], ["userProfile"], ["users"], ["authMe"]).
🎴 Interactive Hover Cards: Hover over any username or avatar (in posts, comments, replies, or admin dashboard) to reveal user profile details (<UserHoverCard />) or reaction lists (<UserListTooltip />).
👤 Profile & Bio Management: Editable profile fields (username supporting capital/lowercase letters, jobTitle up to 50 chars, bio up to 250 chars) and profile avatar uploads.
🔑 Account Password Change Modal: Interactive Change Password modal (ChangePasswordModal.tsx) for local accounts with real-time Zod schema requirement indicators, password visibility toggles, and strict owner-only access.
🛡️ Admin Dashboard: Dedicated administrative panels (/admin/dashboard/users & /admin/dashboard/posts) with real-time search, role-based filter cards, top-sorted Super Admin listing, and role management buttons.
🔄 Automatic Token Refresh & HTTP-Only Cookie Session Management: Automatic access token refresh via Axios client response interceptors (`lib/axiosClient.ts`) using secure `httpOnly` cookies (`refreshToken`). Seamlessly retries failed 401 HTTP requests in the background without disturbing user workflow.
⚙️ Server Side (Backend)
🚀 Node.js & Express.js REST API: Modular controller architecture written in TypeScript.
🔑 Passport.js GitHub OAuth 2.0: Configured passport-github2 strategy with automated DB user creation/lookup, JWT authorization, and httpOnly refresh cookie issuing.
🔐 Dual-Token Architecture & Security: Short-lived access token (15m) + 7-day refresh token stored in `httpOnly`, `sameSite: strict` cookie (`/auth/refresh-token`), server-side logout (`/auth/logout`), bcrypt password hashing, rate-limiting (express-rate-limit with 10 req/min on sensitive password/auth endpoints), and email verification (OTP via Nodemailer with hidden schema selection).
🔐 Role-Based Access Control (RBAC): Fine-grained token verification middlewares (verifyToken, verifyRefreshToken, verifyAdminToken, verifySuperAdminToken, verifyAuthorizedToken).
🛡️ Super Admin & Provider Protection: Strict server-side safeguards preventing regular admins from editing or deleting Super Admin (Owner) profiles, restricting PATCH /users/:id/toggle-admin to Super Admins, and blocking password/email modification on OAuth profiles.
🗄️ MongoDB & Mongoose ORM: Schema definitions with deep populates (user, likes, shares, comments, replies).
☁️ Cloudinary Integration: Automated image uploading and legacy Cloudinary asset cleanup on file replacements or deletions.
🛡️ Validation & Sanitation: Strict Zod schemas validating user inputs across register, login (email or username), change password, profile updates, posts, comments, and replies.
🏗️ Tech Stack
Domain	Technologies
Frontend Core	Next.js 16 (App Router), React 19, TypeScript
Frontend Styling	Tailwind CSS v4, Lucide Icons, Custom Design Tokens
State & Data Fetching	TanStack React Query v5, React Hook Form, Zod, Axios (withCredentials & 401 Token Refresh Interceptor)
Backend Core	Node.js, Express.js (v5), TypeScript (ESM)
Database & ODM	MongoDB, Mongoose
Authentication & Protection	JWT (Access & Refresh Tokens), HTTP-Only Cookies, Passport.js (GitHub OAuth 2.0), Bcrypt.js, Helmet, CORS, Express-Rate-Limit
File Storage & Mail	Cloudinary, Multer, Nodemailer
📁 Repository Structure
Fluxion/
├── frontend/                   # Next.js 16 Frontend Application
│   ├── _components/            # Shared UI Components (Navbar, PostCard, UserHoverCard, Tooltip, etc.)
│   ├── _features/              # Domain-driven features (auth, posts, user)
│   │   ├── auth/               # Auth API, hooks, Zod schemas, types
│   │   ├── posts/              # Post, comment, reply API, hooks, schemas
│   │   └── user/               # Profile API, hooks, Zod schemas, types
│   ├── app/                    # Next.js App Router Pages (Feed, Auth, OAuth Callback, Profile, Admin)
│   └── components/ui/          # Base Primitives (Button, Input, etc.)
│
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── config/             # DB, Passport OAuth & Mail Transporter Configurations
│   │   ├── middlewares/        # Auth, Rate-Limiters, Error Handlers
│   │   ├── modules/            # Domain Modules (auth, posts, comment, reply, user)
│   │   └── utils/              # Cloudinary, SendEmail helpers
│   ├── API-Docs.md             # Complete API Specification Document
│   └── package.json
└── README.md                   # Project Overview (This File)
🚦 Getting Started
1. Prerequisites
Node.js (v18.x or higher)
npm / pnpm / yarn
MongoDB Instance (Local or MongoDB Atlas)
Cloudinary Account & Credentials
GitHub Developer Application (for OAuth 2.0 login)
2. Backend Setup
Navigate to the backend directory:
cd backend
Install dependencies:
npm install
Create a .env file in the backend/ directory:
PORT=5000
MONGO_URI=mongodb://localhost:27017/fluxion
JWT_SECRET_KEY=your_jwt_secret_key
JWT_REFRESH_KEY=your_jwt_refresh_key
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# GitHub OAuth 2.0 Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Credentials (Nodemailer)
APP_EMAIL_ADDRESS=your_email@gmail.com
APP_EMAIL_PASSWORD=your_app_password
Start the backend development server:
npm run dev
3. Frontend Setup
Navigate to the frontend directory:
cd ../frontend
Install dependencies:
npm install
Create a .env.local file in the frontend/ directory:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
Start the frontend development server:
npm run dev
Open http://localhost:3000 in your browser.
📝 License
Distributed under the ISC License. Made by Emad Ahmed.