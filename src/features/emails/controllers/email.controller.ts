import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "../services/email.service";

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
}
