import { useMutation, useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/client";

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      message,
      language,
      conversationId,
    }: {
      message: string;
      language: string;
      conversationId?: string;
    }) => chatApi.sendMessage(message, language, conversationId),
  });
}

export function useChatHistory(userId?: string) {
  return useQuery({
    queryKey: ["chatHistory", userId],
    queryFn: () => (userId ? chatApi.getHistory(userId) : null),
    enabled: !!userId,
  });
}

export function useDeleteConversation() {
  return useMutation({
    mutationFn: (conversationId: string) =>
      chatApi.deleteConversation(conversationId),
  });
}
