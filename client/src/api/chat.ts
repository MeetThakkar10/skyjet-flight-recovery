import { api } from "./client";
import type { ChatMessage } from "@/types";

export function getChatHistory(bookingId: string) {
  return api.get<{ messages: ChatMessage[] }>(`/api/chat/${bookingId}`);
}

export function sendChatMessage(bookingId: string, message: string) {
  return api.post<{ reply: string }>(`/api/chat/${bookingId}`, { message });
}
