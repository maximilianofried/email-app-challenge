import { useState, useCallback, useEffect } from 'react';
import { Email } from '@/lib/schema';
import { useFilter } from '@/contexts/FilterContext';
import { FilterType } from '../types/email.types';

export function useEmailList(initialEmails: Email[]) {
  const { activeFilter } = useFilter();
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  // Track which filter the current emails correspond to. 
  // Initialize with activeFilter assuming initialEmails match it (usually Inbox).
  const [emailsFilter, setEmailsFilter] = useState<FilterType>(FilterType.INBOX);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmailsByFilter = useCallback(async (filter: FilterType, searchTerm?: string) => {
    // Only show searching state for search queries, not filter changes
    if (searchTerm && searchTerm.trim()) {
      setIsSearching(true);
    }

    // Set loading state for all fetches to allow UI to handle transitions
    setIsLoading(true);

    try {
      let url = '/api/emails?';

      if (searchTerm && searchTerm.trim()) {
        url += `search=${encodeURIComponent(searchTerm.trim())}`;
      } else {
        if (filter === FilterType.INBOX) {
          url += 'threaded=true&direction=incoming';
        } else if (filter === FilterType.IMPORTANT) {
          url += 'important=true';
        } else if (filter === FilterType.SENT) {
          url += 'direction=outgoing';
        } else if (filter === FilterType.TRASH) {
          url += 'deleted=true';
        } else {
          url += 'threaded=true';
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const data = await response.json();
      setEmails(data);
      setEmailsFilter(filter);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setEmails(initialEmails);
      setEmailsFilter(FilterType.INBOX);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [initialEmails]);

  useEffect(() => {
    fetchEmailsByFilter(activeFilter);
  }, [activeFilter, fetchEmailsByFilter]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      fetchEmailsByFilter(activeFilter);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/emails?search=${encodeURIComponent(searchTerm.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to search emails');
      }
      const data = await response.json();
      setEmails(data);
      // Search results effectively belong to the current active filter context
      setEmailsFilter(activeFilter);
    } catch (error) {
      console.error('Error searching emails:', error);
      setEmails(initialEmails);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [activeFilter, fetchEmailsByFilter, initialEmails]);

  const removeEmail = useCallback((id: number) => {
     setEmails(prev => prev.filter(e => e.id !== id));
  }, []);

  const removeThread = useCallback((threadId: string) => {
     setEmails(prev => prev.filter(e => e.threadId !== threadId));
  }, []);

  const updateThread = useCallback((threadId: string, updates: Partial<Email>) => {
    setEmails(prev => prev.map(e => e.threadId === threadId ? { ...e, ...updates } : e));
  }, []);

  const updateEmail = useCallback((id: number, updates: Partial<Email>) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const refreshList = useCallback(() => {
    fetchEmailsByFilter(activeFilter);
  }, [fetchEmailsByFilter, activeFilter]);

  return {
    emails,
    emailsFilter, // Exposed new state
    isSearching,
    isLoading,
    handleSearch,
    removeEmail,
    removeThread,
    updateEmail,
    updateThread,
    refreshList,
    activeFilter
  };
}
