import { axiosClient } from "@/lib/axiosClient";
import { FollowUserItem } from "./getUserFollowers";

export interface GetFollowingResponse {
  followingCount: number;
  following: FollowUserItem[];
}

export const getUserFollowing = async (userId: string): Promise<GetFollowingResponse> => {
  const response = await axiosClient.get<{
    success: boolean;
    data: GetFollowingResponse;
  }>(`/users/${userId}/following`);
  return response.data?.data || { followingCount: 0, following: [] };
};
