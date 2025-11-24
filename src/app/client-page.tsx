'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import EmailComposer from '@/components/EmailComposer';
import { Email } from '@/lib/schema';
import { CreateEmailDto } from '@/lib/dtos/emails.dto';
import { useEmailList } from '@/hooks/emails/useEmailList';
import { useEmailSelection } from '@/hooks/emails/useEmailSelection';
import EmailListSidebar from '@/components/EmailListSidebar';
import EmailDetailPanel from '@/components/EmailDetailPanel';
import { FilterType } from '@/lib/types/email.types';
import { API_ENDPOINTS, API_HEADERS, ERROR_MESSAGES, HTTP_METHODS } from '@/lib/constants';
import { useFilter } from '@/contexts/FilterContext';

interface ClientPageProps {
  emails: Email[];
}

export default function ClientPage(props: ClientPageProps) {
  const { emails: initialEmailList } = props;

  const list = useEmailList(initialEmailList);
  const selection = useEmailSelection();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { setEmailCounts } = useFilter();

  // Fetch email counts function - can be called after mutations
  const fetchCounts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.EMAILS + '/counts');
      if (response.ok) {
        const counts = await response.json();
        setEmailCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching email counts:', error);
    }
  };

  // Fetch counts only once on component mount
  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  useEffect(() => {
    selection.clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.activeFilter]);

  const handleEmailClick = async (emailId: number) => {
    if (selection.selectedEmailId === emailId && selection.selectedEmail) {
      return;
    }

    const data = await selection.selectEmail(emailId);

    if (data) {
      const hasUnreadEmails = data.thread?.some((email: Email) => !email.isRead) || !data.email.isRead;

      if (hasUnreadEmails) {
        try {
          await fetch(`${API_ENDPOINTS.EMAILS}/${emailId}`, {
            method: HTTP_METHODS.PATCH,
            headers: API_HEADERS.CONTENT_TYPE_JSON,
            body: JSON.stringify({ markThreadAsRead: true }),
          });

          list.setEmails(prev => prev.map(e => e.threadId === data.email.threadId ? { ...e, isRead: true } : e));

          selection.setThreadEmails(prev => prev.map(e => ({ ...e, isRead: true })));
          selection.setSelectedEmail(prev => prev ? { ...prev, isRead: true } : null);

          fetchCounts(); // Update counts after marking as read
        } catch (e) {
          console.error('Error marking read', e);
        }
      }
    }
  };

  const handleSendEmail = async (data: CreateEmailDto) => {
    const response = await fetch(API_ENDPOINTS.EMAILS, {
      method: HTTP_METHODS.POST,
      headers: API_HEADERS.CONTENT_TYPE_JSON,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || ERROR_MESSAGES.SEND_EMAIL_FAILED);
    }

    list.refreshList();
    fetchCounts();
  };

  const handleDeleteThread = async (emailId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.EMAILS}/${emailId}?thread=true`, {
        method: HTTP_METHODS.DELETE,
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.DELETE_THREAD_FAILED);
      }

      const emailToDelete = list.emails.find(email => email.id === emailId);
      if (emailToDelete) {
        list.setEmails(prev => prev.filter(e => e.threadId !== emailToDelete.threadId));

        if (selection.selectedEmail && selection.selectedEmail.threadId === emailToDelete.threadId) {
          selection.clearSelection();
        }
      }

      list.refreshList();
      fetchCounts();
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleDeleteSingleEmail = async (emailId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.EMAILS}/${emailId}`, {
        method: HTTP_METHODS.DELETE,
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.DELETE_EMAIL_FAILED);
      }

      list.setEmails(prev => prev.filter(e => e.id !== emailId));

      selection.setThreadEmails(prev => prev.filter(e => e.id !== emailId));

      if (selection.selectedEmailId === emailId) {
        selection.clearSelection();
      }

      list.refreshList();
      fetchCounts();
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const handleToggleImportant = async (emailId: number, isImportant: boolean) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.EMAILS}/${emailId}`, {
        method: HTTP_METHODS.PATCH,
        headers: API_HEADERS.CONTENT_TYPE_JSON,
        body: JSON.stringify({ isImportant }),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.TOGGLE_IMPORTANT_FAILED);
      }

      if (list.activeFilter === FilterType.IMPORTANT && !isImportant) {
        list.refreshList();
      } else {
        list.setEmails(prev => prev.map(e => e.id === emailId ? { ...e, isImportant } : e));
      }

      if (selection.selectedEmailId === emailId) {
        selection.setSelectedEmail(prev => prev ? { ...prev, isImportant } : null);
      }

      selection.setThreadEmails(prev => prev.map(e => e.id === emailId ? { ...e, isImportant } : e));

      fetchCounts(); // Update counts after toggling important status
    } catch (error) {
      console.error('Error toggling important status:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <EmailListSidebar
        emails={list.emails}
        isSearching={list.isSearching}
        isLoading={list.isLoading}
        activeFilter={list.activeFilter}
        currentFilter={list.emailsFilter}
        selectedEmailId={selection.selectedEmailId}
        onSearch={list.handleSearch}
        onSelect={handleEmailClick}
        onCompose={() => setIsComposerOpen(true)}
        onDelete={handleDeleteThread}
        onToggleImportant={handleToggleImportant}
        onLoadMore={list.loadMore}
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
      />

      <EmailDetailPanel
        email={selection.selectedEmail}
        thread={selection.threadEmails}
        isLoading={selection.isLoading}
        selectedEmailId={selection.selectedEmailId}
        isInTrash={list.activeFilter === FilterType.TRASH}
        onDelete={handleDeleteSingleEmail}
        onToggleImportant={handleToggleImportant}
      />

      <EmailComposer
        open={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleSendEmail}
      />
    </Box>
  );
}
