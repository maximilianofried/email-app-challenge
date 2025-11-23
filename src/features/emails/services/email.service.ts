import { randomUUID } from 'crypto';
import { EmailRepository } from '../repositories/email.repository';
import { ThreadService } from '@/features/threads/services/thread.service';
import { Email, EmailDirection, EmailData } from '@/lib/schema';
import { CreateEmailDto, EmailWithThreadDto } from '@/lib/dtos/emails.dto';
import { NotFoundError, BadRequestError } from '@/lib/errors';
import { ERROR_MESSAGES } from '@/lib/constants';

export class EmailService {
  private emailRepository: EmailRepository;
  private threadService: ThreadService;

  constructor(
    emailRepository?: EmailRepository,
    threadService?: ThreadService,
  ) {
    this.emailRepository = emailRepository || new EmailRepository();
    this.threadService = threadService || new ThreadService();
  }

  getEmailById = async (id: number, includeDeleted: boolean = false): Promise<Email> => {
    const email = await this.emailRepository.findById(id, includeDeleted);

    if (!email) {
      throw new NotFoundError(ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    return email;
  };

  createEmail = async (data: CreateEmailDto): Promise<Email> => {
    if (!data.subject || !data.to || !data.content) {
      throw new BadRequestError(ERROR_MESSAGES.REQUIRED_FIELDS);
    }

    if (!data.from) {
      throw new BadRequestError(ERROR_MESSAGES.FROM_REQUIRED);
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

  /**
   * Get all non-deleted emails
   */
  getAllEmails = async (): Promise<Email[]> => {
    return await this.emailRepository.findAll();
  };

  /**
   * Get deleted emails only (Trash folder)
   */
  getDeletedEmails = async (): Promise<Email[]> => {
    return await this.emailRepository.findDeleted();
  };

  /**
   * Search emails by text query
   */
  searchEmails = async (query: string): Promise<Email[]> => {
    return await this.emailRepository.search(query);
  };

  /**
   * Get emails filtered by direction (incoming/outgoing)
   */
  getEmailsByDirection = async (direction: EmailDirection): Promise<Email[]> => {
    return await this.emailRepository.findByDirection(direction);
  };

  /**
   * Get important emails only
   */
  getImportantEmails = async (): Promise<Email[]> => {
    return this.emailRepository.findImportant();
  };

  /**
   * Get threaded emails (latest per thread)
   */
  getThreadedEmails = async (
    direction?: EmailDirection,
    limit?: number,
    cursor?: number,
  ): Promise<Email[]> => {
    return await this.threadService.getThreadedEmails(direction, limit, cursor);
  };

  updateReadStatus = async (id: number, isRead: boolean): Promise<Email> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new NotFoundError(ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    if (email.isDeleted) {
      throw new BadRequestError(ERROR_MESSAGES.UPDATE_READ_DELETED);
    }

    return await this.emailRepository.update(id, { isRead });
  };

  toggleImportant = async (id: number, isImportant: boolean): Promise<Email> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new NotFoundError(ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    if (email.isDeleted) {
      throw new BadRequestError(ERROR_MESSAGES.CHANGE_IMPORTANCE_DELETED);
    }

    return await this.emailRepository.update(id, { isImportant });
  };

  deleteEmail = async (id: number): Promise<void> => {
    const email = await this.emailRepository.findById(id);

    if (!email) {
      throw new NotFoundError(ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    if (email.isDeleted) {
      // Already deleted, technically success, but let's be idempotent
      return;
    }

    await this.emailRepository.delete(id);
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
}
