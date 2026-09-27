import { useMutation, useQueryClient } from "@tanstack/react-query";
import { readNotification } from "../api/readNotification";
import { NotificationItem } from "../types/notification";

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => readNotification(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications =
        queryClient.getQueryData<NotificationItem[]>(["notifications"]);

      if (previousNotifications) {
        queryClient.setQueryData<NotificationItem[]>(
          ["notifications"],
          previousNotifications.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
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
