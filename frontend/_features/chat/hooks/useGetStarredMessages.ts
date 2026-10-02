import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getStarredMessages } from "../api/chat.api";
import { ChatMessage } from "../types/chat.types";

export const useGetStarredMessages = (userId: string) => {
  const token = Cookies.get("token");

  return useQuery<ChatMessage[]>({
    queryKey: ["starredMessages", userId],
    queryFn: () => getStarredMessages(userId),
    enabled: !!token && !!userId,
  });
};
