import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LayoutProps } from '../../types';

const drawerWidth = 240;

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(!isMobile);

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header isSidebarOpen={!isMobile && sidebarOpen} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          ml: !isMobile && sidebarOpen ? `${drawerWidth}px` : 0,
        }}
        className="bg-gray-50 min-h-screen"
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
