import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getPinnedMessages } from "../api/chat.api";
import { ChatMessage } from "../types/chat.types";

export const useGetPinnedMessages = (userId: string) => {
  const token = Cookies.get("token");

  return useQuery<ChatMessage[]>({
    queryKey: ["pinnedMessages", userId],
    queryFn: () => getPinnedMessages(userId),
    enabled: !!token && !!userId,
  });
};
