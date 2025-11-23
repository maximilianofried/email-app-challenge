import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "../services/email.service";
import { ThreadService } from "@/features/threads/services/thread.service";
import { CreateEmailDto, EmailListFiltersDto } from "../dtos/emails.dto";
import { EmailDirection } from "@/lib/schema";

export class EmailController {
  private emailService: EmailService;
  private threadService: ThreadService;

  constructor() {
    this.emailService = new EmailService();
    this.threadService = new ThreadService();
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

      const email = await this.emailService.getEmailWithThread(emailId);

      return NextResponse.json(email, { status: 200 });
    } catch (error) {
      if (error instanceof Error && error.message === "Email not Found") {
        return NextResponse.json(
          {
            error: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
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
        direction: body.direction,
      };

      const email = await this.emailService.createEmail(emailData);

      return NextResponse.json(email, { status: 200 });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("required") ||
          error.message.includes("Subject") ||
          error.message.includes("From"))
      ) {
        return NextResponse.json(
          {
            error: error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };

  findAll = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);

      // Parse query parameters into filter DTO
      const filters: EmailListFiltersDto = {
        search: searchParams.get("search") || undefined,
        threaded: searchParams.get("threaded") === "true",
        direction: (searchParams.get("direction") as EmailDirection) || undefined,
        important: searchParams.get("important") === "true" ? true : searchParams.get("important") === "false" ? false : undefined,
        deleted: searchParams.get("deleted") === "true",
      };

      const emails = await this.emailService.getEmailsByFilters(filters);

      return NextResponse.json(emails, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };

  update = async (
    request: NextRequest,
    id: string
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        return NextResponse.json(
          {
            error: "Invalid ID",
          },
          { status: 400 }
        );
      }

      const body = await request.json();

      if (body.isRead !== undefined) {
        const email = await this.emailService.markAsRead(emailId);
        return NextResponse.json(email, { status: 200 });
      }

      if (body.markThreadAsRead === true) {
        const email = await this.emailService.getEmailById(emailId);
        await this.threadService.markThreadAsRead(email.threadId);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      if (body.isImportant !== undefined) {
        const email = await this.emailService.toggleImportant(emailId, body.isImportant);
        return NextResponse.json(email, { status: 200 });
      }

      return NextResponse.json(
        {
          error: "Invalid update data",
        },
        { status: 400 }
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Email not Found") {
        return NextResponse.json(
          {
            error: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };

  delete = async (
    request: NextRequest,
    id: string
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        return NextResponse.json(
          {
            error: "Invalid ID",
          },
          { status: 400 }
        );
      }

      const { searchParams } = new URL(request.url);
      const deleteThread = searchParams.get("thread") === "true";

      if (deleteThread) {
        const email = await this.emailService.getEmailById(emailId);
        await this.threadService.deleteThread(email.threadId);
      } else {
        await this.emailService.deleteEmail(emailId);
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Email not Found" || error.message === "Thread not Found")
      ) {
        return NextResponse.json(
          {
            error: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };
}
