import ClientPage from './client-page';
import { ThreadService } from '@/features/threads/services/thread.service';
import { EmailDirection } from '@/lib/schema';

export default async function Home() {
  const threadService = new ThreadService();
  const emailListDef = await threadService.getThreadedEmailsByDirection(EmailDirection.INCOMING);

  return (
    <ClientPage emails={emailListDef} />
  );
}
