import { randomUUID } from "crypto";
import { EmailRepository } from "../repositories/email.repository";
import { ThreadService } from "@/features/threads/services/thread.service";
import { Email, EmailDirection, EmailData } from "@/lib/schema";
import { CreateEmailDto, EmailListFiltersDto, EmailWithThreadDto } from "@/lib/dtos/emails.dto";
import { NotFoundError, BadRequestError } from "@/lib/errors";

export class EmailService {
  private emailRepository: EmailRepository;
  private threadService: ThreadService;

  constructor(
    emailRepository?: EmailRepository,
    threadService?: ThreadService
  ) {
    this.emailRepository = emailRepository || new EmailRepository();
    this.threadService = threadService || new ThreadService();
  }

  getEmailById = async (id: number, includeDeleted: boolean = false): Promise<Email> => {
    const email = await this.emailRepository.findById(id, includeDeleted);

    if (!email) {
      throw new NotFoundError("Email not Found");
    }

    return email;
  };

  createEmail = async (data: CreateEmailDto): Promise<Email> => {
    if (!data.subject || !data.to || !data.content) {
      throw new BadRequestError("Subject, to, and content are required");
    }

    if (!data.from) {
      throw new BadRequestError("From is required");
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

  updateReadStatus = async (id: number, isRead: boolean): Promise<Email> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new NotFoundError("Email not Found");
    }

    if (email.isDeleted) {
      throw new BadRequestError("Cannot update read status of deleted email");
    }

    return await this.emailRepository.update(id, { isRead });
  };

  toggleImportant = async (id: number, isImportant: boolean): Promise<Email> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new NotFoundError("Email not Found");
    }

    if (email.isDeleted) {
      throw new BadRequestError("Cannot change importance of deleted email");
    }

    return await this.emailRepository.update(id, { isImportant });
  };

  deleteEmail = async (id: number): Promise<void> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new NotFoundError("Email not Found");
    }

    if (email.isDeleted) {
      // Already deleted, technically success, but let's be idempotent
      return;
    }

    await this.emailRepository.delete(id);
  };

  getDeletedEmails = async (): Promise<Email[]> => {
    return await this.emailRepository.findDeleted();
  };

  getEmailWithThread = async (id: number): Promise<EmailWithThreadDto> => {
    const email = await this.getEmailById(id, true);

    let threadEmails: Email[];
    if (email.isDeleted) {
      // If viewing a deleted email, check if entire thread is deleted
      threadEmails = await this.threadService.getThreadEmailsForDeletedEmail(email.threadId);
    } else {
      // If viewing a non-deleted email, show only non-deleted emails
      threadEmails = await this.threadService.getEmailsByThreadId(email.threadId, false, false);
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
        return await this.threadService.getThreadedEmails(filters.direction);
      }
      return await this.threadService.getThreadedEmails();
    }

    // Handle direction filter
    if (filters.direction) {
      return await this.getEmailsByFilter({ direction: filters.direction });
    }

    // Default: return all emails
    return await this.getAllEmails();
  };
}
