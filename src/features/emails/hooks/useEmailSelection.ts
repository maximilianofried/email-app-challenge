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
    // If selecting the same email that is already loaded, do nothing
    // But if we just have the ID and not the full data, we might want to refetch? 
    // The original code checked `selectedEmailId === emailId && selectedEmail`
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

  const updateSelectedEmail = useCallback((updates: Partial<Email> | ((prev: Email | null) => Email | null)) => {
    if (typeof updates === 'function') {
      setSelectedEmail(prev => updates(prev));
    } else {
      setSelectedEmail(prev => prev ? { ...prev, ...updates } : null);
    }
  }, []);

  const updateThreadEmails = useCallback((updater: (emails: Email[]) => Email[]) => {
      setThreadEmails(updater);
  }, []);

  return {
    selectedEmailId,
    selectedEmail,
    threadEmails,
    isLoading,
    selectEmail,
    clearSelection,
    updateSelectedEmail,
    updateThreadEmails
  };
}

