import { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBarProps {
  onSearchChange: (searchTerm: string) => void;
  debounceDelay?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange, debounceDelay = 500 }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange, debounceDelay]);

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
      <TextField
        fullWidth
        placeholder="Search emails..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.default',
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;

