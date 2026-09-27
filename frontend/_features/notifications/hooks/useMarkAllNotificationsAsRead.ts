import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "../api/markAllNotificationsAsRead";
import { NotificationItem } from "../types/notification";

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications =
        queryClient.getQueryData<NotificationItem[]>(["notifications"]);

      if (previousNotifications) {
        queryClient.setQueryData<NotificationItem[]>(
          ["notifications"],
          previousNotifications.map((n) => ({ ...n, isRead: true }))
        );
      }

      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
