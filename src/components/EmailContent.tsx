import React, { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Divider,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Star, StarBorder, Delete } from "@mui/icons-material";
import { Email } from "@/lib/schema";

interface EmailContentProps {
  email: Email;
  threadEmails?: Email[];
  selectedEmailId?: number | null;
  onDelete?: (emailId: number) => void;
  onToggleImportant?: (emailId: number, isImportant: boolean) => void;
  isInTrash?: boolean;
}

const EmailContent: React.FC<EmailContentProps> = ({ email, threadEmails = [], selectedEmailId, onDelete, onToggleImportant, isInTrash = false }) => {
  const selectedEmailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEmailRef.current) {
      selectedEmailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedEmailId, threadEmails]);

  const getInitials = (name: string) => {
    return name.split("@")[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEmail = (threadEmail: Email) => {
    const isSelected = threadEmail.id === selectedEmailId;

    return (
      <Paper
        key={threadEmail.id}
        ref={isSelected ? selectedEmailRef : null}
        elevation={isSelected ? 4 : 1}
        sx={{
          p: 2,
          mb: 2,
          border: isSelected ? 2 : 0,
          borderColor: isSelected ? "primary.main" : "transparent",
          backgroundColor: isSelected ? "action.selected" : "background.paper",
        }}
        id={`email-${threadEmail.id}`}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: (threadEmail.isImportant && !isInTrash) ? "warning.main" : "primary.main",
                width: 40,
                height: 40,
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
            {getInitials(threadEmail.from)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {threadEmail.from}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  to {threadEmail.to}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(threadEmail.createdAt)}
                </Typography>
                {onToggleImportant && !isInTrash && (
                  <Tooltip title={threadEmail.isImportant ? "Mark as not important" : "Mark as important"}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleImportant(threadEmail.id, !threadEmail.isImportant)}
                      sx={{
                        padding: 0.5,
                        '&:hover': {
                          backgroundColor: 'warning.light',
                          color: 'warning.main',
                        },
                      }}
                      aria-label={threadEmail.isImportant ? "Mark as not important" : "Mark as important"}
                    >
                      {threadEmail.isImportant ? (
                        <Star sx={{ fontSize: '1rem', color: 'warning.main' }} />
                      ) : (
                        <StarBorder sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                {onDelete && !isInTrash && (
                  <Tooltip title="Delete this email">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(threadEmail.id)}
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
                  </Tooltip>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              {!threadEmail.isRead && !isInTrash && (
                <Chip label="Unread" size="small" color="warning" variant="outlined" />
              )}
              {threadEmail.isImportant && !isInTrash && (
                <Chip label="Important" size="small" color="secondary" variant="outlined" />
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.6,
          }}
        >
          {threadEmail.content || "No content"}
        </Typography>
      </Paper>
    );
  };

  const displayThread = threadEmails.length > 0;

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      {displayThread ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {email.subject}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {threadEmails.map((threadEmail) => renderEmail(threadEmail))}
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: (email.isImportant && !isInTrash) ? "warning.main" : "primary.main",
                width: 48,
                height: 48,
                fontSize: "1.25rem",
                fontWeight: 600,
              }}
            >
              {getInitials(email.from)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {email.subject}
                  </Typography>
                  {onToggleImportant && !isInTrash && (
                    <Tooltip title={email.isImportant ? "Mark as not important" : "Mark as important"}>
                      <IconButton
                        onClick={() => onToggleImportant(email.id, !email.isImportant)}
                        sx={{
                          padding: 0.5,
                          '&:hover': {
                            backgroundColor: 'warning.light',
                            color: 'warning.main',
                          },
                        }}
                        aria-label={email.isImportant ? "Mark as not important" : "Mark as important"}
                      >
                        {email.isImportant ? (
                          <Star sx={{ color: "warning.main" }} />
                        ) : (
                          <StarBorder sx={{ color: "text.secondary" }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {onDelete && !isInTrash && (
                    <Tooltip title="Delete this email">
                      <IconButton
                        onClick={() => onDelete(email.id)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.main',
                          },
                        }}
                        aria-label="Delete email"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {!email.isRead && !isInTrash && (
                  <Chip label="Unread" size="small" color="warning" />
                )}
                {email.isImportant && !isInTrash && (
                  <Chip label="Important" size="small" color="secondary" />
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                From
              </Typography>
              <Typography variant="body1">{email.from}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                To
              </Typography>
              <Typography variant="body1">{email.to}</Typography>
            </Box>

            {email.cc && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  CC
                </Typography>
                <Typography variant="body1">{email.cc}</Typography>
              </Box>
            )}

            {email.bcc && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  BCC
                </Typography>
                <Typography variant="body1">{email.bcc}</Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Date
              </Typography>
              <Typography variant="body1">{formatDate(email.createdAt)}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Content
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.6,
              }}
            >
              {email.content || "No content"}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EmailContent;

