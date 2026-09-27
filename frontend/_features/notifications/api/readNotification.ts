import { axiosClient } from "@/lib/axiosClient";
import { NotificationItem } from "../types/notification";

export const readNotification = async (
  notificationId: string
): Promise<{ success: boolean; data: NotificationItem }> => {
  const response = await axiosClient.patch(`/notifications/${notificationId}`);
  return response.data;
};
