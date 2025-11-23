import { ThreadRepository } from "../repositories/thread.repository";
import { Email, EmailDirection } from "@/lib/schema";

export class ThreadService {
  private threadRepository: ThreadRepository;

  constructor(threadRepository?: ThreadRepository) {
    this.threadRepository = threadRepository || new ThreadRepository();
  }

  getThreadedEmails = async (direction?: EmailDirection): Promise<Email[]> => {
    if (direction) {
      return await this.threadRepository.findLatestByThreadAndDirection(direction);
    }
    return await this.threadRepository.findLatestByThread();
  };

  getEmailsByThreadId = async (threadId: string, includeDeleted: boolean = false, onlyDeleted: boolean = false): Promise<Email[]> => {
    return await this.threadRepository.findByThreadId(threadId, includeDeleted, onlyDeleted);
  };

  getThreadEmailsForDeletedEmail = async (threadId: string): Promise<Email[]> => {
    // Get all emails in the thread (including deleted)
    const allThreadEmails = await this.threadRepository.findByThreadId(threadId, true, false);

    // Check if all emails in the thread are deleted
    const allDeleted = allThreadEmails.every(email => email.isDeleted);

    if (allDeleted) {
      // If entire thread is deleted, show full thread
      return allThreadEmails;
    } else {
      // If only some emails are deleted, show only deleted emails
      return allThreadEmails.filter(email => email.isDeleted);
    }
  };

  markThreadAsRead = async (threadId: string): Promise<void> => {
    await this.threadRepository.markThreadAsRead(threadId);
  };

  deleteThread = async (threadId: string): Promise<void> => {
    // Check if there are any non-deleted emails in the thread
    const threadEmails = await this.threadRepository.findByThreadId(threadId, false, false);

    if (threadEmails.length === 0) {
      // If no non-deleted emails found, check if thread exists at all (maybe fully deleted)
      const allEmails = await this.threadRepository.findByThreadId(threadId, true, false);
      if (allEmails.length === 0) {
        throw new Error("Thread not Found");
      }
      // If thread exists but all emails are already deleted, consider it a success
      return;
    }

    await this.threadRepository.deleteByThreadId(threadId);
  };
}
