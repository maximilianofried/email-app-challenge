import React from "react";
import {
  Box,
  Typography,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import { Star } from "@mui/icons-material";
import { Email } from "@/lib/schema";

interface EmailContentProps {
  email: Email;
}

const EmailContent: React.FC<EmailContentProps> = ({ email }) => {
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

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: email.isImportant ? "warning.main" : "primary.main",
              width: 48,
              height: 48,
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            {getInitials(email.from)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {email.subject}
              </Typography>
              {email.isImportant && (
                <Star sx={{ color: "warning.main" }} />
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {!email.isRead && (
                <Chip label="Unread" size="small" color="warning" />
              )}
              {email.isImportant && (
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
    </Box>
  );
};

export default EmailContent;

