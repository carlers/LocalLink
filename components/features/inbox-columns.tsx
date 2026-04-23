import type { Message, Notification } from "@/lib/types/message";

type InboxColumnsProps = {
  notifications: Notification[];
  messages: Message[];
};

export function InboxColumns({ notifications, messages }: InboxColumnsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Notifications</h2>
        <ul className="mt-3 space-y-2">
          {notifications.map((notification) => (
            <li key={notification.id} className="rounded-chip bg-surface-muted p-3">
              <p className="font-medium">{notification.title}</p>
              <p className="text-text-muted text-sm">{notification.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Messages</h2>
        <ul className="mt-3 space-y-2">
          {messages.map((message) => (
            <li key={message.id} className="rounded-chip bg-surface-muted p-3">
              <p className="font-medium">{message.senderName}</p>
              <p className="text-text-muted text-sm">{message.preview}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
