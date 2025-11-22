import { db } from "@/lib/database";
import { emails, Email, EmailData, EmailDirection } from "@/lib/schema";
import { eq, desc, asc, like, or, sql, and } from "drizzle-orm";

export class EmailRepository {
  findById = async (id: number): Promise<Email | undefined> => {
    const result = await db
      .select()
      .from(emails)
      .where(eq(emails.id, id))
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

  search = async (query: string): Promise<Email[]> => {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.isDeleted, false),
          or(
            like(emails.subject, searchPattern),
            like(emails.to, searchPattern),
            like(emails.cc, searchPattern),
            like(emails.bcc, searchPattern),
            like(emails.content, searchPattern)
          )
        )
      )
      .orderBy(desc(emails.createdAt));
  };

  findLatestByThread = async (): Promise<Email[]> => {
    const subquery = db
      .select({
        threadId: emails.threadId,
        latestCreatedAt: sql`MAX(${emails.createdAt})`.as('latestCreatedAt'),
      })
      .from(emails)
      .where(eq(emails.isDeleted, false))
      .groupBy(emails.threadId)
      .as('latest');

    const result = await db
      .select()
      .from(emails)
      .innerJoin(
        subquery,
        and(
          eq(emails.threadId, subquery.threadId),
          eq(emails.createdAt, subquery.latestCreatedAt),
          eq(emails.isDeleted, false)
        )
      )
      .orderBy(desc(emails.createdAt));

    return result.map((r) => r.emails);
  };

  findLatestByThreadAndDirection = async (direction: EmailDirection): Promise<Email[]> => {
    const subquery = db
      .select({
        threadId: emails.threadId,
        latestCreatedAt: sql`MAX(${emails.createdAt})`.as('latestCreatedAt'),
      })
      .from(emails)
      .where(and(eq(emails.direction, direction), eq(emails.isDeleted, false)))
      .groupBy(emails.threadId)
      .as('latest');

    const result = await db
      .select()
      .from(emails)
      .innerJoin(
        subquery,
        and(
          eq(emails.threadId, subquery.threadId),
          eq(emails.createdAt, subquery.latestCreatedAt),
          eq(emails.direction, direction),
          eq(emails.isDeleted, false)
        )
      )
      .orderBy(desc(emails.createdAt));

    return result.map((r) => r.emails);
  };

  findByThreadId = async (threadId: string, includeDeleted: boolean = false, onlyDeleted: boolean = false): Promise<Email[]> => {
    const conditions = [eq(emails.threadId, threadId)];

    if (onlyDeleted) {
      conditions.push(eq(emails.isDeleted, true));
    } else if (!includeDeleted) {
      conditions.push(eq(emails.isDeleted, false));
    }

    return await db
      .select()
      .from(emails)
      .where(and(...conditions))
      .orderBy(asc(emails.createdAt));
  };

  findByDirection = async (direction: EmailDirection): Promise<Email[]> => {
    return await db
      .select()
      .from(emails)
      .where(and(eq(emails.direction, direction), eq(emails.isDeleted, false)))
      .orderBy(desc(emails.createdAt));
  };

  findByImportant = async (isImportant: boolean): Promise<Email[]> => {
    return await db
      .select()
      .from(emails)
      .where(and(eq(emails.isImportant, isImportant), eq(emails.isDeleted, false)))
      .orderBy(desc(emails.createdAt));
  };

  update = async (id: number, data: Partial<EmailData>): Promise<Email> => {
    const result = await db
      .update(emails)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(emails.id, id))
      .returning();

    return result[0];
  };

  markThreadAsRead = async (threadId: string): Promise<void> => {
    await db
      .update(emails)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(emails.threadId, threadId));
  };

  delete = async (id: number): Promise<void> => {
    await db
      .update(emails)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(emails.id, id));
  };

  deleteByThreadId = async (threadId: string): Promise<void> => {
    await db
      .update(emails)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(emails.threadId, threadId));
  };

  findDeleted = async (): Promise<Email[]> => {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.isDeleted, true))
      .orderBy(desc(emails.createdAt));
  };
}
