export interface UserProfile {
  _id: string;
  fullName?: string;
  username: string;
  jobTitle?: string;
  email?: string;
  role?: "User" | "Admin" | "SuperAdmin";
  provider?: "local" | "google" | "github";
  isVerified?: boolean;
  postsCount?: number;
  profilePicture?: {
    url?: string;
    publicId?: string;
  };
  bio?: string;
  followers?: string[] | any[];
  following?: string[] | any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PostImage {
  url?: string;
  publicId?: string;
}

export interface Comment {
  _id: string;
  postId?: string;
  text: string;
  user: {
    _id: string;
    fullName?: string;
    username: string;
    jobTitle?: string;
    profilePicture?: {
      url?: string;
    };
  };
  commentImage?: {
    url?: string;
    publicId?: string;
  };
  image?: {
    url?: string;
    publicId?: string;
  };
  likes?: (string | { _id: string; fullName?: string; username?: string; profilePicture?: { url?: string }; jobTitle?: string })[];
  commentLikesCount?: number;
  replyCommentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reply {
  _id: string;
  postId?: string;
  parentComment?: string;
  text: string;
  user: {
    _id: string;
    fullName?: string;
    username: string;
    jobTitle?: string;
    profilePicture?: {
      url?: string;
    };
  };
  commentImage?: {
    url?: string;
    publicId?: string;
  };
  image?: {
    url?: string;
    publicId?: string;
  };
  likes?: (string | { _id: string; fullName?: string; username?: string; profilePicture?: { url?: string }; jobTitle?: string })[];
  replyLikesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostUserSummary {
  _id: string;
  fullName?: string;
  username?: string;
  jobTitle?: string;
  bio?: string;
  profilePicture?: {
    url?: string;
  };
}

export interface Post {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  user: {
    _id: string;
    fullName?: string;
    username: string;
    jobTitle?: string;
    profilePicture?: {
      url?: string;
    };
  };
  postImage?: {
    url?: string;
    publicId?: string;
  };
  image?: {
    url?: string;
    publicId?: string;
  };
  likes?: (string | PostUserSummary)[];
  likesCount?: number;
  shares?: (string | PostUserSummary)[];
  sharesCount?: number;
  comments?: Comment[];
  commentsCount?: number;
  sharedPost?: Post | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostsResponse {
  posts?: Post[];
  data?: Post[];
  total?: number;
  page?: number;
  totalPages?: number;
}
