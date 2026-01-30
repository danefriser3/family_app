import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Box,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { HeaderProps } from '../../types';

const drawerWidth = 240;

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen = true, onToggleSidebar }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? '100%' : isSidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
        ml: isMobile ? 0 : isSidebarOpen ? `${drawerWidth}px` : 0,
      }}
    >
      <Toolbar className="bg-white border-b border-gray-200 justify-between">
        {/* Left side: sidebar toggle (only shown if handler provided) */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onToggleSidebar && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onToggleSidebar}
              className="text-gray-600 hover:text-gray-800"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* Right side: actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="large"
            color="inherit"
            className="text-gray-600 hover:text-gray-800"
          >
            <SearchIcon />
          </IconButton>
          
          <IconButton
            size="large"
            color="inherit"
            className="text-gray-600 hover:text-gray-800"
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            className="text-gray-600 hover:text-gray-800"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profilo</MenuItem>
            <MenuItem onClick={handleClose}>Le mie impostazioni</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
