import { EmailController } from '@/features/emails/controllers/email.controller';

export async function GET(): Promise<Response> {
  const emailController = new EmailController();
  return await emailController.getCounts();
}

