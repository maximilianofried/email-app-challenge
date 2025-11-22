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
  Delete,
} from '@mui/icons-material';

interface EmailProps {
  id: number;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  content: string | null;
  isRead: boolean;
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const EmailCard: React.FC<{ email: EmailProps; onClick?: () => void; onDelete?: (id: number) => void; isInTrash?: boolean }> = ({ email, onClick, onDelete, isInTrash = false }) => {
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
        boxShadow: (email.isRead || isInTrash) ? 0 : 1,
        border: (email.isRead || isInTrash) ? '1px solid' : '2px solid',
        borderColor: (email.isRead || isInTrash) ? 'divider' : 'primary.main',
        backgroundColor: (email.isRead || isInTrash) ? 'background.paper' : 'action.hover',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
          backgroundColor: 'action.hover',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Compact Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: email.isImportant ? 'warning.main' : 'primary.main',
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
              {email.isImportant && (
                <Star sx={{ color: 'warning.main', fontSize: '1rem' }} />
              )}
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
              {email.isImportant && (
                <Star sx={{ color: 'warning.main', fontSize: '1rem' }} />
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
          {email.isImportant && (
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
