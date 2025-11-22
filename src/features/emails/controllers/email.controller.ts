import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "../services/email.service";
import { CreateEmailDto } from "../dtos/emails.dto";
import { EmailDirection, Email } from "@/lib/schema";

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
      
      let threadEmails: Email[];
      if (email.isDeleted) {
        // If viewing a deleted email, check if entire thread is deleted
        threadEmails = await this.emailService.getThreadEmailsForDeletedEmail(email.threadId);
      } else {
        // If viewing a non-deleted email, show only non-deleted emails
        threadEmails = await this.emailService.getEmailsByThreadId(email.threadId, false, false);
      }

      return NextResponse.json(
        {
          email,
          thread: threadEmails,
        },
        { status: 200 }
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

      if (!emailData.subject || !emailData.to || !emailData.content) {
        return NextResponse.json(
          {
            error: "Subject, to, and content are required",
          },
          { status: 400 }
        );
      }

      if (!emailData.from) {
        return NextResponse.json(
          {
            error: "From is required",
          },
          { status: 400 }
        );
      }

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
      const search = searchParams.get("search");
      const threaded = searchParams.get("threaded") === "true";
      const direction = searchParams.get("direction");
      const important = searchParams.get("important");
      const deleted = searchParams.get("deleted") === "true";

      let emails;

      if (deleted) {
        emails = await this.emailService.getDeletedEmails();
      } else {
        const hasFilters = search || important;
        const hasDirectionFilter = direction === "incoming" || direction === "outgoing";

        if (hasFilters) {
          if (search && search.trim()) {
            emails = await this.emailService.searchEmails(search.trim());
          } else {
            const filter: { isImportant?: boolean } = {};

            if (important === "true") {
              filter.isImportant = true;
            }

            emails = await this.emailService.getEmailsByFilter(filter);
          }
        } else if (threaded && hasDirectionFilter) {
          emails = await this.emailService.getThreadedEmails(direction as EmailDirection);
        } else if (threaded) {
          emails = await this.emailService.getThreadedEmails();
        } else if (hasDirectionFilter) {
          emails = await this.emailService.getEmailsByFilter({ direction: direction as EmailDirection });
        } else {
          emails = await this.emailService.getAllEmails();
        }
      }

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
        await this.emailService.markThreadAsRead(email.threadId);
        return NextResponse.json({ success: true }, { status: 200 });
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
        await this.emailService.deleteThread(email.threadId);
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
