import { Box, Typography } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import EmailContent from '@/components/EmailContent';
import { Email } from '@/lib/schema';

interface EmailDetailPanelProps {
  email: Email | null;
  thread: Email[];
  isLoading: boolean;
  selectedEmailId: number | null;
  isInTrash: boolean;
  onDelete: (id: number) => void;
  onToggleImportant: (id: number, isImportant: boolean) => void;
}

export default function EmailDetailPanel({
  email,
  thread,
  isLoading,
  selectedEmailId,
  isInTrash,
  onDelete,
  onToggleImportant,
}: EmailDetailPanelProps) {
  return (
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
      ) : email ? (
        <EmailContent
          email={email}
          threadEmails={thread}
          selectedEmailId={selectedEmailId}
          onDelete={onDelete}
          onToggleImportant={onToggleImportant}
          isInTrash={isInTrash}
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
  );
}

