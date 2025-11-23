import { db } from '@/lib/database';
import { emails, Email, EmailData, EmailDirection } from '@/lib/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';

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
            like(emails.content, searchPattern),
          ),
        ),
      )
      .orderBy(desc(emails.createdAt));
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
}
