import { CreateEmailDto } from '../dtos/emails.dto';

export interface EmailComposerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmailDto) => Promise<void>;
}

export interface EmailComposerFormData {
  from: string;
  subject: string;
  to: string;
  content: string;
  cc: string;
  bcc: string;
}

export type EmailComposerFormErrors = Partial<Record<keyof EmailComposerFormData, string>>;

