import { axiosClient } from "@/lib/axiosClient";

export interface ToggleFollowResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export const toggleFollowUser = async (userId: string): Promise<ToggleFollowResponse> => {
  const response = await axiosClient.put<ToggleFollowResponse>(`/users/${userId}/follow`);
  return response.data;
};
