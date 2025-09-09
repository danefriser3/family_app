import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LayoutProps } from '../../types';

const drawerWidth = 240;

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
        className="bg-gray-50 min-h-screen"
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
