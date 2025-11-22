export interface CreateEmailDto {
  subject: string;
  to: string;
  from: string;
  content: string;
  cc?: string;
  bcc?: string;
  threadId?: string;
}

