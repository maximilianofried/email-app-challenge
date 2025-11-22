import { EmailRepository } from "../repositories/email.repository";
import { Email } from "@/lib/schema";

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
}
