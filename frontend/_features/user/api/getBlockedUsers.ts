import { axiosClient } from "@/lib/axiosClient";
import { FollowUserItem } from "./getUserFollowers";

export interface GetBlockedUsersResponse {
  blockedUsers: FollowUserItem[];
}

export const getBlockedUsers = async (): Promise<GetBlockedUsersResponse> => {
  const response = await axiosClient.get<{
    success: boolean;
    data: GetBlockedUsersResponse;
  }>("/users/blocked-users");
  return response.data?.data || { blockedUsers: [] };
};
