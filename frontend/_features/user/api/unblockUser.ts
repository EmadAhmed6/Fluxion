import { axiosClient } from "@/lib/axiosClient";

export interface UnblockUserResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export const unblockUser = async (userId: string): Promise<UnblockUserResponse> => {
  const response = await axiosClient.patch<UnblockUserResponse>(`/users/${userId}/unblock`);
  return response.data;
};
