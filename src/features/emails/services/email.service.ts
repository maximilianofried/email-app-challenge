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

  getAllEmails = async (): Promise<Email[]> => {
    return await this.emailRepository.findAll();
  };

  getDeletedEmails = async (): Promise<Email[]> => {
    return await this.emailRepository.findDeleted();
  };

  searchEmailsWithFilters = async (
    query: string,
    options?: {
      direction?: EmailDirection;
      important?: boolean;
      deleted?: boolean;
    }
  ): Promise<Email[]> => {
    return await this.emailRepository.searchWithFilters(query, options);
  };

  getEmailsByDirection = async (direction: EmailDirection): Promise<Email[]> => {
    return await this.emailRepository.findByDirection(direction);
  };

  getImportantEmails = async (): Promise<Email[]> => {
    return this.emailRepository.findImportant();
  };


  getThreadedEmailsByDirection = async (
    direction: EmailDirection,
    limit?: number,
    cursor?: number,
  ): Promise<Email[]> => {
    return await this.threadService.getThreadedEmailsByDirection(direction, limit, cursor);
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
      return;
    }

    await this.emailRepository.delete(id);
  };

  getEmailWithThread = async (id: number): Promise<EmailWithThreadDto> => {
    const email = await this.getEmailById(id, true);

    let threadEmails: Email[];
    if (email.isDeleted) {
      threadEmails = await this.threadService.getThreadEmailsForDeletedEmail(email.threadId);
    } else {
      threadEmails = await this.threadService.getEmailsByThreadId(email.threadId, false, false);
    }

    return {
      email,
      thread: threadEmails,
    };
  };

  getEmailCounts = async (): Promise<{ unread: number; important: number }> => {
    const [unread, important] = await Promise.all([
      this.emailRepository.countUnreadInbox(),
      this.emailRepository.countImportant(),
    ]);

    return { unread, important };
  };
}
