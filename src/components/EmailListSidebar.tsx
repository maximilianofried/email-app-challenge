import { Box, Typography, Button, Chip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import SearchBar from '@/components/SearchBar';
import EmailCard from '@/components/EmailCard';
import { Email } from '@/lib/schema';
import { FilterType } from '@/lib/types/email.types';
import { UI_LABELS } from '@/lib/constants';

interface EmailListSidebarProps {
  emails: Email[];
  isSearching: boolean;
  isLoading?: boolean;
  activeFilter: FilterType;
  currentFilter?: FilterType;
  stats: {
    unread: number;
    important: number;
  };
  onSearch: (term: string) => void;
  onCompose: () => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleImportant: (id: number, isImportant: boolean) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export default function EmailListSidebar({
  emails,
  isSearching,
  isLoading,
  activeFilter,
  currentFilter,
  stats,
  onSearch,
  onCompose,
  onSelect,
  onDelete,
  onToggleImportant,
  onLoadMore,
  hasMore,
  isLoadingMore
}: EmailListSidebarProps) {
  // Use currentFilter if provided (based on actual data), otherwise fallback to activeFilter
  const filterForLogic = currentFilter || activeFilter;
  const isInTrash = filterForLogic === FilterType.TRASH;

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
            {activeFilter === FilterType.INBOX ? UI_LABELS.INBOX : activeFilter === FilterType.IMPORTANT ? UI_LABELS.IMPORTANT : activeFilter === FilterType.SENT ? UI_LABELS.SENT : UI_LABELS.TRASH}
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onCompose}
            size="small"
          >
            {UI_LABELS.COMPOSE}
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            label={`${emails.length} ${UI_LABELS.TOTAL}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {!isInTrash && (
            <Chip
              label={`${stats.unread} ${UI_LABELS.UNREAD}`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {activeFilter !== FilterType.IMPORTANT && !isInTrash && (
            <Chip
              label={`${stats.important} ${UI_LABELS.IMPORTANT}`}
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
        {(isSearching && emails.length === 0) || (isLoading && emails.length === 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography color="text.secondary">
               {isSearching ? UI_LABELS.SEARCHING : UI_LABELS.LOADING}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
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
            {hasMore && onLoadMore && (
              <Button 
                onClick={onLoadMore} 
                disabled={isLoadingMore}
                sx={{ mt: 2, mb: 2 }}
                variant="text"
              >
                {isLoadingMore ? UI_LABELS.LOADING : UI_LABELS.LOAD_MORE}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
