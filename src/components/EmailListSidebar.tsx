import { Box, Typography, Button, Chip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import SearchBar from '@/components/SearchBar';
import EmailCard from '@/components/EmailCard';
import { Email } from '@/lib/schema';
import { FilterType } from '@/features/emails/types/email.types';

interface EmailListSidebarProps {
  emails: Email[];
  isSearching: boolean;
  activeFilter: FilterType;
  stats: {
    unread: number;
    important: number;
  };
  onSearch: (term: string) => void;
  onCompose: () => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleImportant: (id: number, isImportant: boolean) => void;
}

export default function EmailListSidebar({
  emails,
  isSearching,
  activeFilter,
  stats,
  onSearch,
  onCompose,
  onSelect,
  onDelete,
  onToggleImportant
}: EmailListSidebarProps) {
  const isInTrash = activeFilter === FilterType.TRASH;

  return (
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
            {activeFilter === FilterType.INBOX ? 'Inbox' : activeFilter === FilterType.IMPORTANT ? 'Important' : activeFilter === FilterType.SENT ? 'Sent' : 'Trash'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onCompose}
            size="small"
          >
            Compose
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            label={`${emails.length} Total`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${stats.unread} Unread`}
            size="small"
            color="warning"
            variant="outlined"
          />
          {activeFilter !== FilterType.IMPORTANT && (
            <Chip
              label={`${stats.important} Important`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Search Bar */}
      <SearchBar onSearchChange={onSearch} />

      {/* Email List - Scrollable */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: 1,
      }} data-testid="email-list">
        {isSearching && emails.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography color="text.secondary">Searching...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {emails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={() => onSelect(email.id)}
                onDelete={onDelete}
                onToggleImportant={onToggleImportant}
                isInTrash={isInTrash}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
