import { db } from "@/lib/database";
import { emails, Email, EmailDirection } from "@/lib/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export class ThreadRepository {
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

  markThreadAsRead = async (threadId: string): Promise<void> => {
    await db
      .update(emails)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(emails.threadId, threadId), eq(emails.isDeleted, false)));
  };

  deleteByThreadId = async (threadId: string): Promise<void> => {
    await db
      .update(emails)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(emails.threadId, threadId), eq(emails.isDeleted, false)));
  };
}

