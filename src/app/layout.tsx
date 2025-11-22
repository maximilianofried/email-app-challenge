import ThemeProvider from '../components/ThemeProvider';
import { Box } from '@mui/material';
import { FilterProvider } from '../contexts/FilterContext';
import SidebarWrapper from '../components/SidebarWrapper';

export const metadata = {
  title: 'Email Client',
  description: 'Modern Email Client built with Next.js and Drizzle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <FilterProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <SidebarWrapper />
              {/* Main Content */}
              <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: 'background.default' }}>
                {children}
              </Box>
            </Box>
          </FilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
