import { useState, useCallback, useEffect, useRef } from 'react';
import { Email } from '@/lib/schema';
import { useFilter } from '@/contexts/FilterContext';
import { FilterType } from '@/lib/types/email.types';
import { CONFIG } from '@/lib/constants';

export function useEmailList(initialEmails: Email[]) {
  const { activeFilter } = useFilter();
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [hasMore, setHasMore] = useState(true);
  const [emailsFilter, setEmailsFilter] = useState<FilterType>(FilterType.INBOX);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Keep track of current search term for pagination
  const currentSearchTerm = useRef<string>('');

  // Store initialEmails in a ref to prevent it from triggering re-fetches
  // This prevents the circular dependency that causes double loading
  const initialEmailsRef = useRef<Email[]>(initialEmails);

  const getApiUrl = (filter: FilterType, searchTerm?: string, cursor?: number) => {
    let url = `/api/emails?limit=${CONFIG.DEFAULT_LIMIT}`;

    if (searchTerm && searchTerm.trim()) {
      url += `&search=${encodeURIComponent(searchTerm.trim())}`;
    } else {
      if (filter === FilterType.INBOX) {
        url += '&threaded=true&direction=incoming';
      } else if (filter === FilterType.IMPORTANT) {
        url += '&important=true';
      } else if (filter === FilterType.SENT) {
        url += '&direction=outgoing';
      } else if (filter === FilterType.TRASH) {
        url += '&deleted=true';
      } else {
        url += '&threaded=true';
      }
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
      // Use the ref to avoid adding it as a dependency which would cause double fetches
      setEmails(initialEmailsRef.current);
      setEmailsFilter(FilterType.INBOX);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, []); // Empty deps array prevents unnecessary re-creation and avoids circular dependency

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

  // Initial fetch on filter change
  useEffect(() => {
    // Reset pagination state when filter changes
    setHasMore(true);
    currentSearchTerm.current = '';
    fetchEmails(activeFilter);
    // fetchEmails is intentionally excluded from deps to prevent double fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    currentSearchTerm.current = searchTerm;
    if (!searchTerm.trim()) {
      fetchEmails(activeFilter, '');
      return;
    }
    fetchEmails(activeFilter, searchTerm);
    // fetchEmails is intentionally excluded from deps to prevent double fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const refreshList = useCallback(() => {
    // Reset to first page
    setHasMore(true);
    fetchEmails(activeFilter, currentSearchTerm.current);
    // fetchEmails is intentionally excluded from deps to prevent double fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

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
