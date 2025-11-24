import { NextRequest } from 'next/server';
import { EmailController } from '@/features/emails/controllers/email.controller';

const emailController = new EmailController();

export async function POST(request: NextRequest): Promise<Response> {
  return await emailController.create(request);
}

export async function GET(request: NextRequest): Promise<Response> {
  return await emailController.findAll(request);
}
