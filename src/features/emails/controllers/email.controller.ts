import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "../services/email.service";
import { ThreadService } from "@/features/threads/services/thread.service";
import {
  createEmailSchema,
  updateEmailSchema,
  emailListFiltersSchema,
  validateInput
} from "@/lib/dtos/emails.dto";
import { handleApiError, BadRequestError } from "@/lib/errors";

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
        throw new BadRequestError("Invalid ID");
      }

      const email = await this.emailService.getEmailWithThread(emailId);

      return NextResponse.json(email, { status: 200 });
    } catch (error) {
      return handleApiError(error);
    }
  };

  create = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const emailData = validateInput(createEmailSchema, body);

      const email = await this.emailService.createEmail(emailData);

      return NextResponse.json(email, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  };

  findAll = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);

      const rawFilters = {
        search: searchParams.get("search") || undefined,
        threaded: searchParams.get("threaded") || undefined,
        direction: searchParams.get("direction") || undefined,
        important: searchParams.get("important") || undefined,
        deleted: searchParams.get("deleted") || undefined,
      };

      const filters = validateInput(emailListFiltersSchema, rawFilters);

      const emails = await this.emailService.getEmailsByFilters(filters);

      return NextResponse.json(emails, { status: 200 });
    } catch (error) {
      return handleApiError(error);
    }
  };

  update = async (
    request: NextRequest,
    id: string
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        throw new BadRequestError("Invalid ID");
      }

      const body = await request.json();
      const updateData = validateInput(updateEmailSchema, body);

      // Prioritize markThreadAsRead
      if (updateData.markThreadAsRead === true) {
        const email = await this.emailService.getEmailById(emailId);
        await this.threadService.markThreadAsRead(email.threadId);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Handle isRead (supports true and false)
      if (updateData.isRead !== undefined) {
        const email = await this.emailService.updateReadStatus(emailId, updateData.isRead);
        return NextResponse.json(email, { status: 200 });
      }

      // Handle isImportant
      if (updateData.isImportant !== undefined) {
        const email = await this.emailService.toggleImportant(emailId, updateData.isImportant);
        return NextResponse.json(email, { status: 200 });
      }

      throw new BadRequestError("Invalid update data");
    } catch (error) {
      return handleApiError(error);
    }
  };

  delete = async (
    request: NextRequest,
    id: string
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        throw new BadRequestError("Invalid ID");
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
      return handleApiError(error);
    }
  };
}

