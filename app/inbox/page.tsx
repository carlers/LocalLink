import { InboxColumns } from "@/components/features/inbox-columns";
import { mockMessages, mockNotifications } from "@/lib/mocks/messages";

export default function InboxPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="text-text-muted text-sm">
        Notifications and messaging placeholders are ready for Supabase wiring.
      </p>
      <InboxColumns notifications={mockNotifications} messages={mockMessages} />
    </div>
  );
}
