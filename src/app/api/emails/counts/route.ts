import { EmailController } from '@/features/emails/controllers/email.controller';

const emailController = new EmailController();

export async function GET(): Promise<Response> {
  return await emailController.getCounts();
}

