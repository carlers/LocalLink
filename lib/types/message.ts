export type Message = {
  id: string;
  conversationId: string;
  senderName: string;
  preview: string;
  sentAt: string;
  isUnread: boolean;
};

export type Conversation = {
  id: string;
  partnerName: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type Notification = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  isRead: boolean;
};
