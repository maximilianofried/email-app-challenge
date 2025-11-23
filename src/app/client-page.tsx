'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import EmailComposer from '@/components/EmailComposer';
import { Email } from '@/lib/schema';
import { CreateEmailDto } from '@/features/emails/dtos/emails.dto';
import { useEmailList } from '@/features/emails/hooks/useEmailList';
import { useEmailSelection } from '@/features/emails/hooks/useEmailSelection';
import EmailListSidebar from '@/components/EmailListSidebar';
import EmailDetailPanel from '@/components/EmailDetailPanel';
import { FilterType } from '@/features/emails/types/email.types';

interface ClientPageProps {
  emails: Email[];
}

export default function ClientPage(props: ClientPageProps) {
  const { emails: initialEmailList } = props;
  const router = useRouter();

  // 1. Init Hooks
  const list = useEmailList(initialEmailList);
  const selection = useEmailSelection();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // 2. Derived State (Stats)
  const unreadCount = list.emails.filter(email => !email.isRead).length;
  const importantCount = list.emails.filter(email => email.isImportant).length;

  // Clear selection when filter changes
  useEffect(() => {
    selection.clearSelection();
  }, [list.activeFilter, selection.clearSelection]);

  // 3. Handlers
  const handleEmailClick = async (emailId: number) => {
    // If already selected, do nothing
    if (selection.selectedEmailId === emailId && selection.selectedEmail) {
      return;
    }

    const data = await selection.selectEmail(emailId);

    if (data) {
       // Mark entire thread as read if any email in the thread is unread
       const hasUnreadEmails = data.thread?.some((email: Email) => !email.isRead) || !data.email.isRead;

       if (hasUnreadEmails) {
         try {
            await fetch(`/api/emails/${emailId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ markThreadAsRead: true }),
            });

            // Update List (optimistic)
            list.updateThread(data.email.threadId, { isRead: true });

            // Update Selection (optimistic)
            selection.updateThreadEmails(prev => prev.map(e => ({ ...e, isRead: true })));
            selection.updateSelectedEmail({ isRead: true });

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
        // Remove from list
        list.removeThread(emailToDelete.threadId);

        // Clear selection if it was the deleted thread
        if (selection.selectedEmail && selection.selectedEmail.threadId === emailToDelete.threadId) {
          selection.clearSelection();
        }
      }

      // Refresh list to be sure
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

      // Remove from list
      list.removeEmail(emailId);

      // Remove from selection thread
      selection.updateThreadEmails(prev => prev.filter(e => e.id !== emailId));

      // If the specific selected email was deleted
      if (selection.selectedEmailId === emailId) {
         selection.clearSelection();
      } else if (selection.selectedEmail) {
         // Optionally refresh thread data if needed
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

      // If we're in the important view and unmarking, refresh
      if (list.activeFilter === FilterType.IMPORTANT && !isImportant) {
        list.refreshList();
      } else {
        // Update list
        list.updateEmail(emailId, { isImportant });
      }

      // Update selection if needed
      if (selection.selectedEmailId === emailId) {
        selection.updateSelectedEmail({ isImportant });
      }

      // Update thread in selection
      selection.updateThreadEmails(prev => prev.map(e => e.id === emailId ? { ...e, isImportant } : e));

    } catch (error) {
      console.error('Error toggling important status:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <EmailListSidebar
        emails={list.emails}
        isSearching={list.isSearching}
        activeFilter={list.activeFilter}
        stats={{ unread: unreadCount, important: importantCount }}
        onSearch={list.handleSearch}
        onSelect={handleEmailClick}
        onCompose={() => setIsComposerOpen(true)}
        onDelete={handleDeleteThread}
        onToggleImportant={handleToggleImportant}
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
