import { randomUUID } from "crypto";
import { EmailRepository } from "../repositories/email.repository";
import { Email, EmailDirection, EmailData } from "@/lib/schema";
import { CreateEmailDto, EmailListFiltersDto, EmailWithThreadDto } from "../dtos/emails.dto";

export class EmailService {
  private emailRepository: EmailRepository;

  constructor() {
    this.emailRepository = new EmailRepository();
  }

  getEmailById = async (id: number): Promise<Email> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new Error("Email not Found");
    }

    return email;
  };

  createEmail = async (data: CreateEmailDto): Promise<Email> => {
    if (!data.subject || !data.to || !data.content) {
      throw new Error("Subject, to, and content are required");
    }

    if (!data.from) {
      throw new Error("From is required");
    }

    const threadId = data.threadId || randomUUID();
    const direction = data.direction || EmailDirection.OUTGOING;

    const emailData: EmailData = {
      threadId,
      subject: data.subject,
      from: data.from,
      to: data.to,
      cc: data.cc || null,
      bcc: data.bcc || null,
      content: data.content,
      direction,
      isRead: direction === EmailDirection.OUTGOING,
      isImportant: false,
    };

    return await this.emailRepository.create(emailData);
  };

  getAllEmails = async (): Promise<Email[]> => {
    return await this.emailRepository.findAll();
  };

  searchEmails = async (query: string): Promise<Email[]> => {
    return await this.emailRepository.search(query);
  };

  getThreadedEmails = async (direction?: EmailDirection): Promise<Email[]> => {
    if (direction) {
      return await this.emailRepository.findLatestByThreadAndDirection(direction);
    }
    return await this.emailRepository.findLatestByThread();
  };

  getEmailsByThreadId = async (threadId: string, includeDeleted: boolean = false, onlyDeleted: boolean = false): Promise<Email[]> => {
    return await this.emailRepository.findByThreadId(threadId, includeDeleted, onlyDeleted);
  };

  getThreadEmailsForDeletedEmail = async (threadId: string): Promise<Email[]> => {
    // Get all emails in the thread (including deleted)
    const allThreadEmails = await this.emailRepository.findByThreadId(threadId, true, false);

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

  getEmailsByFilter = async (filter: {
    direction?: EmailDirection;
    isImportant?: boolean;
  }): Promise<Email[]> => {
    if (filter.direction !== undefined) {
      return await this.emailRepository.findByDirection(filter.direction);
    }

    if (filter.isImportant !== undefined) {
      return await this.emailRepository.findByImportant(filter.isImportant);
    }

    return await this.emailRepository.findAll();
  };

  markAsRead = async (id: number): Promise<Email> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new Error("Email not Found");
    }

    return await this.emailRepository.update(id, { isRead: true });
  };

  markThreadAsRead = async (threadId: string): Promise<void> => {
    await this.emailRepository.markThreadAsRead(threadId);
  };

  toggleImportant = async (id: number, isImportant: boolean): Promise<Email> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new Error("Email not Found");
    }

    return await this.emailRepository.update(id, { isImportant });
  };

  deleteEmail = async (id: number): Promise<void> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new Error("Email not Found");
    }

    await this.emailRepository.delete(id);
  };

  deleteThread = async (threadId: string): Promise<void> => {
    const threadEmails = await this.emailRepository.findByThreadId(threadId);

    if (threadEmails.length === 0) {
      throw new Error("Thread not Found");
    }

    await this.emailRepository.deleteByThreadId(threadId);
  };

  getDeletedEmails = async (): Promise<Email[]> => {
    return await this.emailRepository.findDeleted();
  };

  getEmailWithThread = async (id: number): Promise<EmailWithThreadDto> => {
    const email = await this.getEmailById(id);

    let threadEmails: Email[];
    if (email.isDeleted) {
      // If viewing a deleted email, check if entire thread is deleted
      threadEmails = await this.getThreadEmailsForDeletedEmail(email.threadId);
    } else {
      // If viewing a non-deleted email, show only non-deleted emails
      threadEmails = await this.getEmailsByThreadId(email.threadId, false, false);
    }

    return {
      email,
      thread: threadEmails,
    };
  };

  getEmailsByFilters = async (filters: EmailListFiltersDto): Promise<Email[]> => {
    // Handle deleted emails filter
    if (filters.deleted) {
      return await this.getDeletedEmails();
    }

    // Handle search filter (takes priority over other filters)
    if (filters.search && filters.search.trim()) {
      return await this.searchEmails(filters.search.trim());
    }

    // Handle important filter
    if (filters.important !== undefined) {
      const filter = { isImportant: filters.important };
      return await this.getEmailsByFilter(filter);
    }

    // Handle threaded view with optional direction filter
    if (filters.threaded) {
      if (filters.direction) {
        return await this.getThreadedEmails(filters.direction);
      }
      return await this.getThreadedEmails();
    }

    // Handle direction filter
    if (filters.direction) {
      return await this.getEmailsByFilter({ direction: filters.direction });
    }

    // Default: return all emails
    return await this.getAllEmails();
  };
}
