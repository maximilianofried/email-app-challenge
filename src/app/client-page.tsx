'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import EmailComposer from '@/components/EmailComposer';
import { Email } from '@/lib/schema';
import { CreateEmailDto } from '@/lib/dtos/emails.dto';
import { useEmailList } from '@/hooks/emails/useEmailList';
import { useEmailSelection } from '@/hooks/emails/useEmailSelection';
import EmailListSidebar from '@/components/EmailListSidebar';
import EmailDetailPanel from '@/components/EmailDetailPanel';
import { FilterType } from '@/lib/types/email.types';

interface ClientPageProps {
  emails: Email[];
}

export default function ClientPage(props: ClientPageProps) {
  const { emails: initialEmailList } = props;
  const router = useRouter();

  const list = useEmailList(initialEmailList);
  const selection = useEmailSelection();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const unreadCount = list.emails.filter(email => !email.isRead).length;
  const importantCount = list.emails.filter(email => email.isImportant).length;

  useEffect(() => {
    selection.clearSelection();
  }, [list.activeFilter, selection.clearSelection]);

  const handleEmailClick = async (emailId: number) => {
    if (selection.selectedEmailId === emailId && selection.selectedEmail) {
      return;
    }

    const data = await selection.selectEmail(emailId);

    if (data) {
       const hasUnreadEmails = data.thread?.some((email: Email) => !email.isRead) || !data.email.isRead;

       if (hasUnreadEmails) {
         try {
            await fetch(`/api/emails/${emailId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ markThreadAsRead: true }),
            });

            list.setEmails(prev => prev.map(e => e.threadId === data.email.threadId ? { ...e, isRead: true } : e));

            selection.setThreadEmails(prev => prev.map(e => ({ ...e, isRead: true })));
            selection.setSelectedEmail(prev => prev ? { ...prev, isRead: true } : null);

         } catch (e) {
             console.error("Error marking read", e);
         }
       }
    }
  };

  const handleSendEmail = async (data: CreateEmailDto) => {
    const response = await fetch('/api/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    router.refresh();
  };

  const handleDeleteThread = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}?thread=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete thread');
      }

      const emailToDelete = list.emails.find(email => email.id === emailId);
      if (emailToDelete) {
        list.setEmails(prev => prev.filter(e => e.threadId !== emailToDelete.threadId));

        if (selection.selectedEmail && selection.selectedEmail.threadId === emailToDelete.threadId) {
          selection.clearSelection();
        }
      }

      list.refreshList();
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleDeleteSingleEmail = async (emailId: number) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email');
      }

      list.setEmails(prev => prev.filter(e => e.id !== emailId));

      selection.setThreadEmails(prev => prev.filter(e => e.id !== emailId));

      if (selection.selectedEmailId === emailId) {
         selection.clearSelection();
      }

      list.refreshList();
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const handleToggleImportant = async (emailId: number, isImportant: boolean) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isImportant }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle important status');
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
        stats={{ unread: unreadCount, important: importantCount }}
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
