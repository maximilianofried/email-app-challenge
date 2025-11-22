import { EmailDirection, Email } from "@/lib/schema";

export interface CreateEmailDto {
  subject: string;
  to: string;
  from: string;
  content: string;
  cc?: string;
  bcc?: string;
  threadId?: string;
  direction?: EmailDirection;
}

export interface EmailListFiltersDto {
  search?: string;
  threaded?: boolean;
  direction?: EmailDirection;
  important?: boolean;
  deleted?: boolean;
}

export interface EmailWithThreadDto {
  email: Email;
  thread: Email[];
}

