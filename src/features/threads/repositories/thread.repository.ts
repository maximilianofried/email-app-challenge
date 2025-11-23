import { db } from '@/lib/database';
import { emails, Email, EmailDirection } from '@/lib/schema';
import { eq, desc, asc, sql, and, lt } from 'drizzle-orm';
import { CONFIG } from '@/lib/constants';

export class ThreadRepository {
  findLatestByThread = async (limit: number = CONFIG.DEFAULT_LIMIT, cursor?: number): Promise<Email[]> => {
    const subquery = db
      .select({
        threadId: emails.threadId,
        latestId: sql`MAX(${emails.id})`.as('latestId'),
      })
      .from(emails)
      .where(eq(emails.isDeleted, false))
      .groupBy(emails.threadId)
      .as('latest');

    let whereClause = and(
      eq(emails.threadId, subquery.threadId),
      eq(emails.id, subquery.latestId),
      eq(emails.isDeleted, false),
    );

    if (cursor) {
      whereClause = and(whereClause, lt(emails.id, cursor));
    }

    const result = await db
      .select()
      .from(emails)
      .innerJoin(
        subquery,
        whereClause,
      )
      .orderBy(desc(emails.id))
      .limit(limit);

    return result.map((r) => r.emails);
  };

  findLatestByThreadAndDirection = async (direction: EmailDirection, limit: number = CONFIG.DEFAULT_LIMIT, cursor?: number): Promise<Email[]> => {
    const subquery = db
      .select({
        threadId: emails.threadId,
        latestId: sql`MAX(${emails.id})`.as('latestId'),
      })
      .from(emails)
      .where(and(eq(emails.direction, direction), eq(emails.isDeleted, false)))
      .groupBy(emails.threadId)
      .as('latest');

    let whereClause = and(
      eq(emails.threadId, subquery.threadId),
      eq(emails.id, subquery.latestId),
      eq(emails.direction, direction),
      eq(emails.isDeleted, false),
    );

    if (cursor) {
      whereClause = and(whereClause, lt(emails.id, cursor));
    }

    const result = await db
      .select()
      .from(emails)
      .innerJoin(
        subquery,
        whereClause,
      )
      .orderBy(desc(emails.id))
      .limit(limit);

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

