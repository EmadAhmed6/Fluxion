import { useQuery } from "@tanstack/react-query";
import { getMessages } from "../api/chat.api";
import { ChatMessage } from "../types/chat.types";
import Cookies from "js-cookie";

export const useGetMessages = (userId: string) => {
  const token = Cookies.get("token");

  return useQuery<ChatMessage[]>({
    queryKey: ["chatMessages", userId],
    queryFn: () => getMessages(userId),
    enabled: !!token && !!userId,
    refetchInterval: 2500, // Poll every 2.5s when active chat is opened
    staleTime: 1500,
  });
};
