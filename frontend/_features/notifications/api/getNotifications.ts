import { axiosClient } from "@/lib/axiosClient";
import { NotificationItem, NotificationsResponse } from "../types/notification";

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await axiosClient.get<NotificationsResponse>("/notifications");
  const data = response.data?.data;
  return Array.isArray(data) ? data : [];
};
