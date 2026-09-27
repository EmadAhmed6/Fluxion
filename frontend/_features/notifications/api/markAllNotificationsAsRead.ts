import { axiosClient } from "@/lib/axiosClient";

export const markAllNotificationsAsRead = async () => {
  const response = await axiosClient.patch("/notifications");
  return response.data;
};
