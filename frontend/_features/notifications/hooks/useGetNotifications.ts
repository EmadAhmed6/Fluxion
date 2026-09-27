import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/getNotifications";
import Cookies from "js-cookie";

export const useGetNotifications = () => {
  const token = Cookies.get("token");

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: !!token,
    refetchInterval: 12000, // Poll every 12 seconds for real-time notification updates
    refetchOnWindowFocus: true,
  });

  const notifications = query.data || [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return {
    ...query,
    notifications,
    unreadCount,
  };
};
