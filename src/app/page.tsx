import React from 'react';
import ClientPage from '@/app/client-page';
import { EmailService } from '@/features/emails/services/email.service';

export default async function Home() {
  const emailService = new EmailService();
  const emailListDef = await emailService.getThreadedEmails();

  return (
    <ClientPage emails={emailListDef} />
  );
}

