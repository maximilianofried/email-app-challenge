import { useState, useCallback, useEffect, useRef } from 'react';
import { Email } from '@/lib/schema';
import { useFilter } from '@/contexts/FilterContext';
import { FilterType } from '@/lib/types/email.types';
import { CONFIG } from '@/lib/constants';

export function useEmailList(initialEmails: Email[]) {
  const { activeFilter } = useFilter();
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [hasMore, setHasMore] = useState(initialEmails.length === CONFIG.DEFAULT_LIMIT);
  const [emailsFilter, setEmailsFilter] = useState<FilterType>(FilterType.INBOX);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const currentSearchTerm = useRef<string>('');

  const initialEmailsRef = useRef<Email[]>(initialEmails);

  const getApiUrl = (filter: FilterType, searchTerm?: string, cursor?: number) => {
    let url = `/api/emails?limit=${CONFIG.DEFAULT_LIMIT}`;

    // Add search parameter if provided
    if (searchTerm && searchTerm.trim()) {
      url += `&search=${encodeURIComponent(searchTerm.trim())}`;
    }

    // Always apply filter parameters (even when searching)
    if (filter === FilterType.INBOX) {
      url += '&threaded=true&direction=incoming';
    } else if (filter === FilterType.IMPORTANT) {
      url += '&important=true';
    } else if (filter === FilterType.SENT) {
      url += '&direction=outgoing';
    } else if (filter === FilterType.TRASH) {
      url += '&deleted=true';
    }

    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    return url;
  };

  const fetchEmails = useCallback(async (filter: FilterType, searchTerm?: string) => {
    if (searchTerm !== undefined) {
      currentSearchTerm.current = searchTerm;
    }

    if (searchTerm && searchTerm.trim()) {
      setIsSearching(true);
    }

    setIsLoading(true);

    try {
      const url = getApiUrl(filter, currentSearchTerm.current);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(data);
      setHasMore(data.length === CONFIG.DEFAULT_LIMIT);
      setEmailsFilter(filter);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setEmails(initialEmailsRef.current);
      setEmailsFilter(FilterType.INBOX);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || emails.length === 0) return;

    setIsLoadingMore(true);
    const lastEmail = emails[emails.length - 1];
    const cursor = lastEmail.id;

    try {
      const url = getApiUrl(activeFilter, currentSearchTerm.current, cursor);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch more emails');
      }

      const data = await response.json();

      if (data.length > 0) {
        setEmails(prev => [...prev, ...data]);
        setHasMore(data.length === CONFIG.DEFAULT_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more emails:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeFilter, emails, isLoadingMore, hasMore]);

  useEffect(() => {
    currentSearchTerm.current = '';
    fetchEmails(activeFilter);
  }, [activeFilter, fetchEmails]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    currentSearchTerm.current = searchTerm;
    if (!searchTerm.trim()) {
      fetchEmails(activeFilter, '');
      return;
    }
    fetchEmails(activeFilter, searchTerm);
  }, [activeFilter, fetchEmails]);

  const refreshList = useCallback(() => {
    fetchEmails(activeFilter, currentSearchTerm.current);
  }, [activeFilter, fetchEmails]);

  return {
    emails,
    emailsFilter,
    isSearching,
    isLoading,
    isLoadingMore,
    hasMore,
    handleSearch,
    setEmails,
    refreshList,
    activeFilter,
    loadMore,
  };
}
