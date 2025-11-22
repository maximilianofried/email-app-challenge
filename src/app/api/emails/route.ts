import { NextRequest } from 'next/server';
import { EmailController } from '@/features/emails/controllers/email.controller';

export async function POST(request: NextRequest): Promise<Response> {
  const emailController = new EmailController();
  return await emailController.create(request);
}

export async function GET(request: NextRequest): Promise<Response> {
  const emailController = new EmailController();
  return await emailController.findAll(request);
}
