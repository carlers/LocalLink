import { InboxWorkspace } from '@/components/features/inbox-workspace';

type ConversationPageProps = {
  params: {
    conversationId: string;
  };
};

export default function ConversationPage({ params }: ConversationPageProps) {
  return <InboxWorkspace initialConversationId={params.conversationId} />;
}