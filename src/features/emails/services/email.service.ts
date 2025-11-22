import { randomUUID } from "crypto";
import { EmailRepository } from "../repositories/email.repository";
import { Email, EmailDirection, EmailData } from "@/lib/schema";
import { CreateEmailDto } from "../dtos/emails.dto";

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

  getEmailsByThreadId = async (threadId: string): Promise<Email[]> => {
    return await this.emailRepository.findByThreadId(threadId);
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
}
