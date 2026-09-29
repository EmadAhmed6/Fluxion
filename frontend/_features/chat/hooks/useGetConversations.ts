import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../api/chat.api";
import { ChatConversation } from "../types/chat.types";
import Cookies from "js-cookie";

export const useGetConversations = () => {
  const token = Cookies.get("token");

  return useQuery<ChatConversation[]>({
    queryKey: ["chatConversations"],
    queryFn: getConversations,
    enabled: !!token,
    refetchInterval: 5000, // Poll every 5s for latest conversation updates
    staleTime: 3000,
  });
};
