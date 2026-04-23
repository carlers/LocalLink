import type { Message, Notification } from "@/lib/types/message";

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "New connection request",
    detail: "Bayanihan Bakers wants to connect with your business.",
    createdAt: "Today",
  },
  {
    id: "notif-2",
    title: "Opportunity nearby",
    detail: "A store in Pasig posted an urgent need for rice sacks.",
    createdAt: "Yesterday",
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderName: "Bayanihan Bakers",
    preview: "Can we trade delivery crates for flour supplies?",
    sentAt: "11:05 AM",
    isUnread: true,
  },
  {
    id: "msg-2",
    conversationId: "conv-2",
    senderName: "Luntiang Farms",
    preview: "We can deliver vegetables this Friday.",
    sentAt: "Yesterday",
    isUnread: false,
  },
];
