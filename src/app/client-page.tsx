'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Typography, Button } from '@mui/material';
import { Email as EmailIcon, Edit as EditIcon } from '@mui/icons-material';
import EmailCard from '@/components/EmailCard';
import EmailContent from '@/components/EmailContent';
import EmailComposer from '@/components/EmailComposer';
import SearchBar from '@/components/SearchBar';
import { Email } from '@/lib/schema';
import { CreateEmailDto } from '@/features/emails/dtos/emails.dto';
import { useFilter } from '@/contexts/FilterContext';

interface ClientPageProps {
  emails: Email[];
}

type FilterType = 'inbox' | 'important' | 'sent' | 'trash';

export default function ClientPage(props: ClientPageProps) {
  const { emails: initialEmailList } = props;
  const router = useRouter();
  const { activeFilter } = useFilter();
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [threadEmails, setThreadEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [displayedEmails, setDisplayedEmails] = useState<Email[]>(initialEmailList);
  const [isSearching, setIsSearching] = useState(false);

  const unreadCount = displayedEmails.filter(email => !email.isRead).length;
  const importantCount = displayedEmails.filter(email => email.isImportant).length;

  const fetchEmailsByFilter = useCallback(async (filter: FilterType, searchTerm?: string) => {
    // Only show searching state for search queries, not filter changes
    if (searchTerm && searchTerm.trim()) {
      setIsSearching(true);
    }
    try {
      let url = '/api/emails?';
      
      if (searchTerm && searchTerm.trim()) {
        url += `search=${encodeURIComponent(searchTerm.trim())}`;
      } else {
        if (filter === 'inbox') {
          url += 'threaded=true&direction=incoming';
        } else if (filter === 'important') {
          url += 'important=true';
        } else if (filter === 'sent') {
          url += 'direction=outgoing';
        } else if (filter === 'trash') {
          url += 'deleted=true';
        } else {
          url += 'threaded=true';
        }
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const emails = await response.json();
      setDisplayedEmails(emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setDisplayedEmails(initialEmailList);
    } finally {
      setIsSearching(false);
    }
  }, [initialEmailList]);


  useEffect(() => {
    fetchEmailsByFilter(activeFilter);
  }, [activeFilter, fetchEmailsByFilter]);

  const handleSearchChange = useCallback(async (searchTerm: string) => {
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
      const emails = await response.json();
      setDisplayedEmails(emails);
    } catch (error) {
      console.error('Error searching emails:', error);
      setDisplayedEmails(initialEmailList);
    } finally {
      setIsSearching(false);
    }
  }, [activeFilter, fetchEmailsByFilter, initialEmailList]);

  const handleEmailClick = async (emailId: number) => {
    if (selectedEmailId === emailId && selectedEmail) {
      return;
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

      // Mark entire thread as read if any email in the thread is unread
      const hasUnreadEmails = data.thread?.some((email: Email) => !email.isRead) || !data.email.isRead;
      if (hasUnreadEmails) {
        await fetch(`/api/emails/${emailId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ markThreadAsRead: true }),
        });

        // Update the displayed emails list to reflect the read status for all emails in the thread
        const threadIds = new Set([data.email.threadId]);
        setDisplayedEmails(prevEmails =>
          prevEmails.map(email =>
            threadIds.has(email.threadId) ? { ...email, isRead: true } : email
          )
        );

        // Update thread emails to reflect read status
        setThreadEmails(prevThread =>
          prevThread.map(email => ({ ...email, isRead: true }))
        );

        // Update selected email to reflect read status
        setSelectedEmail(prevEmail => prevEmail ? { ...prevEmail, isRead: true } : null);
      }
    } catch (error) {
      console.error('Error fetching email:', error);
      setSelectedEmail(null);
    } finally {
      setIsLoading(false);
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

  const handleDeleteEmail = async (emailId: number) => {
    try {
      // Delete entire thread when called from EmailCard
      const response = await fetch(`/api/emails/${emailId}?thread=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete thread');
      }

      // Get the threadId of the deleted email to remove all emails from that thread
      const emailToDelete = displayedEmails.find(email => email.id === emailId);
      if (emailToDelete) {
        // Remove all emails from the same thread
        setDisplayedEmails(prevEmails =>
          prevEmails.filter(email => email.threadId !== emailToDelete.threadId)
        );

        // If any email from the deleted thread was selected, clear the selection
        if (selectedEmail && selectedEmail.threadId === emailToDelete.threadId) {
          setSelectedEmailId(null);
          setSelectedEmail(null);
          setThreadEmails([]);
        }
      }

      // Refresh the email list based on current filter
      fetchEmailsByFilter(activeFilter);
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleDeleteSingleEmail = async (emailId: number) => {
    try {
      // Delete only the specific email when called from EmailContent
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email');
      }

      // Remove deleted email from displayed list
      setDisplayedEmails(prevEmails => prevEmails.filter(email => email.id !== emailId));

      // Remove from thread emails if it's in the thread view
      setThreadEmails(prevThread => prevThread.filter(email => email.id !== emailId));

      // If the deleted email was selected, clear the selection
      if (selectedEmailId === emailId) {
        setSelectedEmailId(null);
        setSelectedEmail(null);
        setThreadEmails([]);
      } else if (selectedEmail) {
        // Refresh the thread view to reflect the deletion
        const refreshResponse = await fetch(`/api/emails/${selectedEmailId}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setThreadEmails(data.thread || []);
        }
      }

      // Refresh the email list based on current filter
      fetchEmailsByFilter(activeFilter);
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Panel - Email List */}
      <Box sx={{
        width: '400px',
        borderRight: '1px solid',
        borderRightColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {activeFilter === 'inbox' ? 'Inbox' : activeFilter === 'important' ? 'Important' : activeFilter === 'sent' ? 'Sent' : 'Trash'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsComposerOpen(true)}
              size="small"
            >
              Compose
            </Button>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label={`${displayedEmails.length} Total`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${unreadCount} Unread`}
              size="small"
              color="warning"
              variant="outlined"
            />
            {activeFilter !== 'important' && (
              <Chip
                label={`${importantCount} Important`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Search Bar */}
        <SearchBar onSearchChange={handleSearchChange} />

        {/* Email List - Scrollable */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: 1,
        }} data-testid="email-list">
          {isSearching && displayedEmails.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography color="text.secondary">Searching...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {displayedEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => handleEmailClick(email.id)}
                  onDelete={handleDeleteEmail}
                  isInTrash={activeFilter === 'trash'}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Right Panel - Email Content */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }} data-testid="email-content-panel">
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        ) : selectedEmail ? (
          <EmailContent
            email={selectedEmail}
            threadEmails={threadEmails}
            selectedEmailId={selectedEmailId}
            onDelete={handleDeleteSingleEmail}
            isInTrash={activeFilter === 'trash'}
          />
        ) : (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 4,
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}/>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Select an email to view
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose an email from the list to see its content here
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <EmailComposer
        open={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleSendEmail}
      />
    </Box>
  );
}
