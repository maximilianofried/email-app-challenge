import { db } from '@/lib/database';
import { emails, Email, EmailData, EmailDirection } from '@/lib/schema';
import { eq, desc, like, or, and, count } from 'drizzle-orm';

export class EmailRepository {
  findById = async (id: number, includeDeleted: boolean = false): Promise<Email | undefined> => {
    const conditions = [eq(emails.id, id)];

    if (!includeDeleted) {
      conditions.push(eq(emails.isDeleted, false));
    }

    const result = await db
      .select()
      .from(emails)
      .where(and(...conditions))
      .limit(1);

    return result[0];
  };

  create = async (data: EmailData): Promise<Email> => {
    const result = await db.insert(emails).values(data).returning();
    return result[0];
  };

  findAll = async (): Promise<Email[]> => {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.isDeleted, false))
      .orderBy(desc(emails.createdAt));
  };

  searchWithFilters = async (
    query: string,
    options?: {
      direction?: EmailDirection;
      important?: boolean;
      deleted?: boolean;
    }
  ): Promise<Email[]> => {
    const searchPattern = `%${query}%`;
    const conditions = [
      or(
        like(emails.subject, searchPattern),
        like(emails.from, searchPattern),
        like(emails.to, searchPattern),
        like(emails.cc, searchPattern),
        like(emails.bcc, searchPattern),
        like(emails.content, searchPattern),
      ),
    ];

    // Apply filters based on options
    if (options?.deleted !== undefined) {
      conditions.push(eq(emails.isDeleted, options.deleted));
    } else {
      // Default: exclude deleted emails
      conditions.push(eq(emails.isDeleted, false));
    }

    if (options?.direction) {
      conditions.push(eq(emails.direction, options.direction));
    }

    if (options?.important !== undefined) {
      conditions.push(eq(emails.isImportant, options.important));
    }

    return await db
      .select()
      .from(emails)
      .where(and(...conditions))
      .orderBy(desc(emails.createdAt));
  };

  findByDirection = async (direction: EmailDirection): Promise<Email[]> => {
    return await db
      .select()
      .from(emails)
      .where(and(eq(emails.direction, direction), eq(emails.isDeleted, false)))
      .orderBy(desc(emails.createdAt));
  };

  findImportant = async (): Promise<Email[]> => {
    return await db
      .select()
      .from(emails)
      .where(and(eq(emails.isImportant, true), eq(emails.isDeleted, false)))
      .orderBy(desc(emails.createdAt));
  };

  update = async (id: number, data: Partial<EmailData>): Promise<Email> => {
    const result = await db
      .update(emails)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(emails.id, id), eq(emails.isDeleted, false)))
      .returning();

    return result[0];
  };

  delete = async (id: number): Promise<void> => {
    await db
      .update(emails)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(emails.id, id));
  };

  findDeleted = async (): Promise<Email[]> => {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.isDeleted, true))
      .orderBy(desc(emails.createdAt));
  };

  countUnreadInbox = async (): Promise<number> => {
    const result = await db
      .select({ count: count() })
      .from(emails)
      .where(
        and(
          eq(emails.isDeleted, false),
          eq(emails.direction, EmailDirection.INCOMING),
          eq(emails.isRead, false),
        ),
      );
    return result[0]?.count || 0;
  };

  countImportant = async (): Promise<number> => {
    const result = await db
      .select({ count: count() })
      .from(emails)
      .where(
        and(
          eq(emails.isDeleted, false),
          eq(emails.isImportant, true),
        ),
      );
    return result[0]?.count || 0;
  };
}
