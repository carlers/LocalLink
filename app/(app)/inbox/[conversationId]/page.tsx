import { InboxWorkspace } from '@/components/features/inbox-workspace';

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  return <InboxWorkspace initialConversationId={conversationId} />;
}