import { db } from "@/lib/database";
import { emails, Email, EmailData } from "@/lib/schema";
import { eq, desc, like, or } from "drizzle-orm";

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
      .orderBy(desc(emails.createdAt));
  };

  search = async (query: string): Promise<Email[]> => {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(emails)
      .where(
        or(
          like(emails.subject, searchPattern),
          like(emails.to, searchPattern),
          like(emails.cc, searchPattern),
          like(emails.bcc, searchPattern),
          like(emails.content, searchPattern)
        )
      )
      .orderBy(desc(emails.createdAt));
  };
}
