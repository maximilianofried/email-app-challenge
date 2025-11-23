import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Star,
  StarBorder,
  Delete,
} from '@mui/icons-material';
import { Email } from '@/lib/schema';

/**
 * Props for the EmailCard component
 */
interface EmailCardProps {
  /** Email object to display */
  email: Email;
  /** Callback when the card is clicked */
  onClick?: () => void;
  /** Callback to delete the email, receives email ID */
  onDelete?: (id: number) => void;
  /** Callback to toggle important status, receives email ID and new status */
  onToggleImportant?: (id: number, isImportant: boolean) => void;
  /** Whether the email is in the trash folder */
  isInTrash?: boolean;
  /** Whether this email is currently selected */
  isSelected?: boolean;
}

const EmailCard: React.FC<EmailCardProps> = ({
  email,
  onClick,
  onDelete,
  onToggleImportant,
  isInTrash = false,
  isSelected = false,
}) => {
  const getInitials = (name: string) => {
    return name.split('@')[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const emailDate = new Date(date);
    const diffInHours = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return emailDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return emailDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <Card
      data-testid={`email-card-${email.id}`}
      onClick={onClick}
      sx={{
        borderRadius: 1,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: isSelected
          ? 'action.selected'
          : (!email.isRead && !isInTrash)
            ? 'action.hover'
            : 'background.paper',
        boxShadow: isSelected ? 2 : 0,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
          backgroundColor: isSelected ? 'action.selected' : 'action.hover',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Compact Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: (email.isImportant && !isInTrash) ? 'warning.main' : 'primary.main',
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {getInitials(email.from)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography
                variant="subtitle2"
                data-testid={`email-subject-${email.id}`}
                sx={{
                  fontWeight: email.isRead ? 400 : 600,
                  color: email.isRead ? 'text.secondary' : 'text.primary',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {email.subject}
              </Typography>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email.from}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {formatDate(email.createdAt)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              {onToggleImportant && !isInTrash && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleImportant(email.id, !email.isImportant);
                  }}
                  sx={{
                    padding: 0.5,
                    '&:hover': {
                      backgroundColor: 'warning.light',
                      color: 'warning.main',
                    },
                  }}
                  aria-label={email.isImportant ? 'Mark as not important' : 'Mark as important'}
                >
                  {email.isImportant ? (
                    <Star sx={{ color: 'warning.main', fontSize: '1rem' }} />
                  ) : (
                    <StarBorder sx={{ color: 'text.secondary', fontSize: '1rem' }} />
                  )}
                </IconButton>
              )}
              {!email.isRead && !isInTrash && (
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }} />
              )}
              {onDelete && !isInTrash && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(email.id);
                  }}
                  sx={{
                    padding: 0.5,
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.main',
                    },
                  }}
                  aria-label="Delete email"
                >
                  <Delete sx={{ fontSize: '1rem' }} />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        {/* Compact Content Preview */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1,
          }}
        >
          {
            email.content ?
              email.content.substring(0, 30) + '...' :
              'Empty content'
          }
        </Typography>

        {/* Compact Status */}
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          {!email.isRead && !isInTrash && (
            <Chip
              label="Unread"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
          {email.isImportant && !isInTrash && (
            <Chip
              label="Important"
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmailCard;
