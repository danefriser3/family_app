import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const drawerWidth = 240;

export const Layout: React.FC<{ children: React.ReactNode; activeTab: string }> = ({ children, activeTab }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Detect iPhone 13 Pro Max (portrait and landscape) to default close
  const isIPhone13PMPortrait = useMediaQuery('(device-width: 428px) and (device-height: 926px)');
  const isIPhone13PMLandscape = useMediaQuery('(device-width: 926px) and (device-height: 428px)');
  const isIPhone13PM = isIPhone13PMPortrait || isIPhone13PMLandscape;
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(!isMobile && !isIPhone13PM);

  React.useEffect(() => {
    setSidebarOpen(!isMobile && !isIPhone13PM);
  }, [isMobile, isIPhone13PM]);
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar activeTab={activeTab} />
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
