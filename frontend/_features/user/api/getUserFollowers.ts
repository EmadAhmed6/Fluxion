import { axiosClient } from "@/lib/axiosClient";

export interface FollowUserItem {
  _id: string;
  fullName?: string;
  username: string;
  jobTitle?: string;
  profilePicture?: {
    url?: string;
    publicId?: string | null;
  };
}

export interface GetFollowersResponse {
  followersCount: number;
  followers: FollowUserItem[];
}

export const getUserFollowers = async (userId: string): Promise<GetFollowersResponse> => {
  const response = await axiosClient.get<{
    success: boolean;
    data: GetFollowersResponse;
  }>(`/users/${userId}/followers`);
  return response.data?.data || { followersCount: 0, followers: [] };
};
