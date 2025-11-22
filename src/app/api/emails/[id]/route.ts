import { NextRequest } from "next/server";
import { EmailController } from "@/features/emails/controllers/email.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const emailController = new EmailController();
  return await emailController.findById(request, id);
}
