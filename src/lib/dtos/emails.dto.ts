import { EmailDirection, Email } from "@/lib/schema";
import { z } from "zod";

// Zod Schemas

export const createEmailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  to: z.email("Invalid 'to' email address"),
  from: z.email("Invalid 'from' email address"),
  content: z.string().min(1, "Content is required"),
  cc: z.email("Invalid 'cc' email address").optional().or(z.literal("")),
  bcc: z.email("Invalid 'bcc' email address").optional().or(z.literal("")),
  threadId: z.uuid("Invalid thread ID format").optional(),
  direction: z.enum(EmailDirection).optional(),
});

export const updateEmailSchema = z.object({
  isRead: z.boolean().optional(),
  markThreadAsRead: z.boolean().optional(),
  isImportant: z.boolean().optional(),
});

export const emailListFiltersSchema = z.object({
  search: z.string().optional(),
  threaded: z.string().transform((val) => val === "true").pipe(z.boolean()).optional(),
  direction: z.enum(EmailDirection).optional(),
  important: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .pipe(z.boolean().optional())
    .optional(),
  deleted: z.string().transform((val) => val === "true").pipe(z.boolean()).optional(),
  cursor: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

// TypeScript Types (derived from Zod)

export type CreateEmailDto = z.infer<typeof createEmailSchema>;
export type UpdateEmailDto = z.infer<typeof updateEmailSchema>;
export type EmailListFiltersDto = z.infer<typeof emailListFiltersSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: number;
}

export interface EmailWithThreadDto {
  email: Email;
  thread: Email[];
}

// Validation Helper
export function validateInput<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation Error: ${result.error.issues.map((e) => e.message).join(", ")}`);
  }
  return result.data;
}
