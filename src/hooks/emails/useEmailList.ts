import { useState, useCallback, useEffect } from 'react';
import { Email } from '@/lib/schema';
import { useFilter } from '@/contexts/FilterContext';
import { FilterType } from '@/lib/types/email.types';

export function useEmailList(initialEmails: Email[]) {
  const { activeFilter } = useFilter();
  const [emails, setEmails] = useState<Email[]>(initialEmails);

  const [emailsFilter, setEmailsFilter] = useState<FilterType>(FilterType.INBOX);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getApiUrl = (filter: FilterType, searchTerm?: string) => {
    if (searchTerm && searchTerm.trim()) {
      return `/api/emails?search=${encodeURIComponent(searchTerm.trim())}`;
    }

    let url = '/api/emails?';
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
    return url;
  };

  const fetchEmails = useCallback(async (filter: FilterType, searchTerm?: string) => {
    if (searchTerm && searchTerm.trim()) {
      setIsSearching(true);
    }

    setIsLoading(true);

    try {
      const url = getApiUrl(filter, searchTerm);
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

  // Initial fetch on filter change
  useEffect(() => {
    fetchEmails(activeFilter);
  }, [activeFilter, fetchEmails]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      fetchEmails(activeFilter);
      return;
    }
    fetchEmails(activeFilter, searchTerm);
  }, [activeFilter, fetchEmails]);

  const refreshList = useCallback(() => {
    fetchEmails(activeFilter);
  }, [fetchEmails, activeFilter]);

  return {
    emails,
    emailsFilter,
    isSearching,
    isLoading,
    handleSearch,
    setEmails,
    refreshList,
    activeFilter
  };
}
