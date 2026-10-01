import { axiosClient } from "@/lib/axiosClient";

export interface BlockUserResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export const blockUser = async (userId: string): Promise<BlockUserResponse> => {
  const response = await axiosClient.patch<BlockUserResponse>(`/users/${userId}/block`);
  return response.data;
};
