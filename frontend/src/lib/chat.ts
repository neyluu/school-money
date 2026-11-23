import { authorizedRequest } from "@/lib/authorized-client";

export type ChatUser = {
  id: number;
  firstName: string;
  lastName: string;
};

export type ChatMessage = {
  id: number;
  chatId: number;
  sender: ChatUser;
  content: string;
  createdAt: string;
};

export type Chat = {
  id: number;
  type: "CLASS" | "PRIVATE";
  title: string;
  classId: number | null;
  otherUser: ChatUser | null;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  canSend: boolean;
  createdAt: string;
};

const MESSAGES_PAGE_SIZE = 50;
const MESSAGE_MAX_LENGTH = 2000;

async function getChats(): Promise<Chat[]> {
  return authorizedRequest<Chat[]>("/chats");
}

async function getChat(chatId: number): Promise<Chat> {
  return authorizedRequest<Chat>(`/chats/${chatId}`);
}

async function getClassChat(classId: number): Promise<Chat> {
  return authorizedRequest<Chat>(`/chats/class/${classId}`);
}

async function getChatContacts(): Promise<ChatUser[]> {
  return authorizedRequest<ChatUser[]>("/chats/contacts");
}

async function openPrivateChat(userId: number): Promise<Chat> {
  return authorizedRequest<Chat>("/chats/private", {
    method: "POST",
    body: { userId },
  });
}

async function getMessages(
  chatId: number,
  range?: { before: number } | { after: number },
): Promise<ChatMessage[]> {
  const params = new URLSearchParams({ size: String(MESSAGES_PAGE_SIZE) });
  if (range != null) {
    for (const [key, value] of Object.entries(range)) {
      params.set(key, String(value));
    }
  }
  return authorizedRequest<ChatMessage[]>(
    `/chats/${chatId}/messages?${params}`,
  );
}

async function sendMessage(
  chatId: number,
  content: string,
): Promise<ChatMessage> {
  return authorizedRequest<ChatMessage>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: { content },
  });
}

async function hideChat(chatId: number): Promise<void> {
  await authorizedRequest<void>(`/chats/${chatId}/hide`, { method: "POST" });
}

async function markAsRead(chatId: number): Promise<void> {
  await authorizedRequest<void>(`/chats/${chatId}/read`, { method: "POST" });
}

export {
  getChat,
  getChatContacts,
  getClassChat,
  getChats,
  getMessages,
  hideChat,
  markAsRead,
  MESSAGE_MAX_LENGTH,
  MESSAGES_PAGE_SIZE,
  openPrivateChat,
  sendMessage,
};
