import { useState, useCallback } from 'react';
import { Email } from '@/lib/schema';

export function useEmailSelection() {
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [threadEmails, setThreadEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearSelection = useCallback(() => {
    setSelectedEmailId(null);
    setSelectedEmail(null);
    setThreadEmails([]);
  }, []);

  const selectEmail = useCallback(async (emailId: number) => {
    if (selectedEmailId === emailId && selectedEmail) {
      return null;
    }

    setSelectedEmailId(emailId);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/emails/${emailId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch email');
      }
      const data = await response.json();
      setSelectedEmail(data.email);
      setThreadEmails(data.thread || []);

      return data;
    } catch (error) {
      console.error('Error fetching email:', error);
      setSelectedEmail(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmailId, selectedEmail]);

  return {
    selectedEmailId,
    selectedEmail,
    threadEmails,
    isLoading,
    selectEmail,
    clearSelection,
    setSelectedEmail,
    setThreadEmails
  };
}
