'use client';

import { Box, Divider, MenuList, MenuItem, ListItemText, ListItemIcon, Typography, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

type FilterType = 'inbox' | 'important' | 'sent' | 'trash';

interface SidebarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function Sidebar({ activeFilter, onFilterChange }: SidebarProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderRight: '1px solid',
        borderRightColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          📧 Email Client
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 1 }}>
        <MenuList sx={{ p: 0 }}>
          <MenuItem
            sx={{
              borderRadius: 2,
              mb: 0.5,
              backgroundColor: activeFilter === 'inbox' ? 'action.selected' : 'transparent',
            }}
            onClick={() => onFilterChange('inbox')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <InboxIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Inbox"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem
            sx={{
              borderRadius: 2,
              mb: 0.5,
              backgroundColor: activeFilter === 'important' ? 'action.selected' : 'transparent',
            }}
            onClick={() => onFilterChange('important')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <StarIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Important"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem
            sx={{
              borderRadius: 2,
              mb: 0.5,
              backgroundColor: activeFilter === 'sent' ? 'action.selected' : 'transparent',
            }}
            onClick={() => onFilterChange('sent')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Sent"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>

          <Divider sx={{ my: 2 }} />

          <MenuItem
            sx={{
              borderRadius: 2,
              mb: 0.5,
              backgroundColor: activeFilter === 'trash' ? 'action.selected' : 'transparent',
            }}
            onClick={() => onFilterChange('trash')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Trash"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>
        </MenuList>
      </Box>
    </Paper>
  );
}

