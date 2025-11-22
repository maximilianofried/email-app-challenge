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

    const emailData: EmailData = {
      threadId,
      subject: data.subject,
      from: data.from,
      to: data.to,
      cc: data.cc || null,
      bcc: data.bcc || null,
      content: data.content,
      direction: data.direction || EmailDirection.OUTGOING,
      isRead: false,
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
}
