export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: any;
}

export interface ForgotPasswordData {
  email: string;
}

export interface AuthMe {
  _id: string;
  fullName?: string;
  username: string;
  jobTitle?: string;
  email: string;
  isVerified?: boolean;
  postsCount: number;
  profilePicture: {
    url: string;
    publicId: string;
  };
  role: "User" | "Admin" | "SuperAdmin";
  provider?: "local" | "google" | "github";
  followers?: string[];
  following?: string[];
  createdAt: string;
  updatedAt: string;
}
