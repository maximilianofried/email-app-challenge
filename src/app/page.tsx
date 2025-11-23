import ClientPage from "./client-page";
import { ThreadService } from "@/features/threads/services/thread.service";

export default async function Home() {
  const threadService = new ThreadService();
  const emailListDef = await threadService.getThreadedEmails();

  return (
    <ClientPage emails={emailListDef} />
  );
}