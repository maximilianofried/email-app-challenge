'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Typography, Button } from '@mui/material';
import { Email as EmailIcon, Edit as EditIcon } from '@mui/icons-material';
import EmailCard from '@/components/EmailCard';
import EmailContent from '@/components/EmailContent';
import EmailComposer from '@/components/EmailComposer';
import SearchBar from '@/components/SearchBar';
import { Email } from '@/lib/schema';
import { CreateEmailDto } from '@/features/emails/dtos/emails.dto';

interface ClientPageProps {
  emails: Email[];
}

export default function ClientPage(props: ClientPageProps) {
  const { emails: initialEmailList } = props;
  const router = useRouter();
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [displayedEmails, setDisplayedEmails] = useState<Email[]>(initialEmailList);
  const [isSearching, setIsSearching] = useState(false);

  const unreadCount = displayedEmails.filter(email => !email.isRead).length;
  const importantCount = displayedEmails.filter(email => email.isImportant).length;

  const handleSearchChange = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setDisplayedEmails(initialEmailList);
      setIsSearching(false);
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
  }, [initialEmailList]);

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
      setSelectedEmail(data);
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
              Inbox
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
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
            <Chip
              label={`${importantCount} Important`}
              size="small"
              color="secondary"
              variant="outlined"
            />
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
          {isSearching ? (
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
          <EmailContent email={selectedEmail} />
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
