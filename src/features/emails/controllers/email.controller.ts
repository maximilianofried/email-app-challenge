import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../services/email.service';
import { ThreadService } from '@/features/threads/services/thread.service';
import {
  createEmailSchema,
  updateEmailSchema,
  emailListFiltersSchema,
  validateInput,
} from '@/lib/dtos/emails.dto';
import { handleApiError, BadRequestError } from '@/lib/errors';
import { ERROR_MESSAGES } from '@/lib/constants';

export class EmailController {
  private emailService: EmailService;
  private threadService: ThreadService;

  constructor() {
    this.emailService = new EmailService();
    this.threadService = new ThreadService();
  }

  /**
   * Helper: Resolve which service method to call based on filter criteria.
   * This centralizes the routing logic and makes it testable.
   *
   * Filter priority:
   * 1. Search (with optional direction/important/deleted filters)
   * 2. Threaded (grouped by conversation, requires direction)
   * 3. Direction (incoming/outgoing)
   * 4. Important (starred/flagged emails)
   * 5. Deleted (Trash folder)
   * 6. Default (all emails)
   */
  private resolveEmailQuery(filters: ReturnType<typeof emailListFiltersSchema.parse>) {
    if (filters.search?.trim()) {
      return () => this.emailService.searchEmailsWithFilters(filters.search!.trim(), {
        direction: filters.direction,
        important: filters.important,
        deleted: filters.deleted,
        limit: filters.limit,
        cursor: filters.cursor,
      });
    }

    if (filters.threaded) {
      const direction = filters.direction;
      if (!direction) {
        throw new BadRequestError('Direction is required when using threaded view');
      }
      return () => this.emailService.getThreadedEmailsByDirection(
        direction,
        filters.limit,
        filters.cursor,
      );
    }

    if (filters.direction) {
      return () => this.emailService.getEmailsByDirection(
        filters.direction!,
        filters.limit,
        filters.cursor,
      );
    }

    if (filters.important) {
      return () => this.emailService.getImportantEmails(
        filters.limit,
        filters.cursor,
      );
    }

    if (filters.deleted) {
      return () => this.emailService.getDeletedEmails(
        filters.limit,
        filters.cursor,
      );
    }

    return () => this.emailService.getAllEmails();
  }

  findById = async (
    request: NextRequest,
    id: string,
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        throw new BadRequestError(ERROR_MESSAGES.INVALID_ID);
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
        search: searchParams.get('search') || undefined,
        threaded: searchParams.get('threaded') || undefined,
        direction: searchParams.get('direction') || undefined,
        important: searchParams.get('important') || undefined,
        deleted: searchParams.get('deleted') || undefined,
        cursor: searchParams.get('cursor') || undefined,
        limit: searchParams.get('limit') || undefined,
      };

      const filters = validateInput(emailListFiltersSchema, rawFilters);

      const queryMethod = this.resolveEmailQuery(filters);
      const emails = await queryMethod();

      return NextResponse.json(emails, { status: 200 });
    } catch (error) {
      return handleApiError(error);
    }
  };

  update = async (
    request: NextRequest,
    id: string,
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        throw new BadRequestError(ERROR_MESSAGES.INVALID_ID);
      }

      const body = await request.json();
      const updateData = validateInput(updateEmailSchema, body);

      if (updateData.markThreadAsRead === true) {
        const email = await this.emailService.getEmailById(emailId);
        await this.threadService.markThreadAsRead(email.threadId);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      if (updateData.isRead !== undefined) {
        const email = await this.emailService.updateReadStatus(emailId, updateData.isRead);
        return NextResponse.json(email, { status: 200 });
      }

      if (updateData.isImportant !== undefined) {
        const email = await this.emailService.toggleImportant(emailId, updateData.isImportant);
        return NextResponse.json(email, { status: 200 });
      }

      throw new BadRequestError(ERROR_MESSAGES.INVALID_UPDATE_DATA);
    } catch (error) {
      return handleApiError(error);
    }
  };

  delete = async (
    request: NextRequest,
    id: string,
  ): Promise<NextResponse> => {
    try {
      const emailId = parseInt(id, 10);

      if (isNaN(emailId) || emailId <= 0) {
        throw new BadRequestError(ERROR_MESSAGES.INVALID_ID);
      }

      const { searchParams } = new URL(request.url);
      const deleteThread = searchParams.get('thread') === 'true';

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

  getCounts = async (): Promise<NextResponse> => {
    try {
      const counts = await this.emailService.getEmailCounts();
      return NextResponse.json(counts, { status: 200 });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

