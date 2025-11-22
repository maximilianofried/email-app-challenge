import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "../services/email.service";
import { CreateEmailDto } from "../dtos/emails.dto";

export class EmailController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  findById = async (
    request: NextRequest,
    id: string
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid ID",
          },
          { status: 400 }
        );
      }

      const email = await this.emailService.getEmailById(emailId);

      return NextResponse.json(
        {
          success: true,
          data: email,
        },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Email not Found") {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };

  create = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const emailData: CreateEmailDto = {
        subject: body.subject,
        to: body.to,
        from: body.from,
        content: body.content,
        cc: body.cc,
        bcc: body.bcc,
        threadId: body.threadId,
      };

      if (!emailData.subject || !emailData.to || !emailData.content) {
        return NextResponse.json(
          {
            success: false,
            error: "Subject, to, and content are required",
          },
          { status: 400 }
        );
      }

      if (!emailData.from) {
        return NextResponse.json(
          {
            success: false,
            error: "From is required",
          },
          { status: 400 }
        );
      }

      const email = await this.emailService.createEmail(emailData);

      return NextResponse.json(
        {
          success: true,
          data: email,
        },
        { status: 200 }
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("required") ||
          error.message.includes("Subject") ||
          error.message.includes("From"))
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };
}
