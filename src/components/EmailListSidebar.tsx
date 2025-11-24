import { Box, Typography, Button } from '@mui/material';
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
  selectedEmailId: number | null;
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
  selectedEmailId,
  onSearch,
  onCompose,
  onSelect,
  onDelete,
  onToggleImportant,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: EmailListSidebarProps) {

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
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              {activeFilter === FilterType.INBOX ? UI_LABELS.INBOX : activeFilter === FilterType.IMPORTANT ? UI_LABELS.IMPORTANT : activeFilter === FilterType.SENT ? UI_LABELS.SENT : UI_LABELS.TRASH}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {emails.length} {
                activeFilter === FilterType.INBOX
                  ? (emails.length === 1 ? 'conversation' : 'conversations')
                  : (emails.length === 1 ? 'message' : 'messages')
              }
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onCompose}
            size="small"
          >
            {UI_LABELS.COMPOSE}
          </Button>
        </Box>
      </Box>

      {/* Search Bar - key forces reset when filter changes */}
      <SearchBar key={activeFilter} onSearchChange={onSearch} />

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
                  isSelected={selectedEmailId === email.id}
                />
              ))}
            </Box>
            {hasMore && onLoadMore && emails.length > 0 && (
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
