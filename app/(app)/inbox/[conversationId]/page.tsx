import { InboxWorkspace } from '@/components/features/inbox-workspace';

type ConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  return <InboxWorkspace initialConversationId={conversationId} />;
}