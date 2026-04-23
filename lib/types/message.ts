export type Message = {
  id: string;
  conversationId: string;
  senderName: string;
  preview: string;
  sentAt: string;
  isUnread: boolean;
};

export type Notification = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};
