import { db } from "@/lib/database";
import { emails, Email, EmailData } from "@/lib/schema";
import { eq } from "drizzle-orm";

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
}
