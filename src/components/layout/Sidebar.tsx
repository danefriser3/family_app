import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { MenuItem, SidebarProps } from '../../types';
import ShoppingCartSharp from '@mui/icons-material/ShoppingCartSharp';

const drawerWidth = 240;

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'expenses', label: 'Spese', icon: <BarChartIcon /> },
  { id: 'incomes', label: 'Entrate', icon: <AttachMoneyIcon /> },
  { id: 'aldi', label: 'Aldi', icon: <ShoppingCartSharp /> },
  { id: 'inventory', label: 'Inventario', icon: <InventoryIcon /> },
  { id: 'reports', label: 'Report', icon: <AssessmentIcon /> },
  { id: 'profile', label: 'Profilo', icon: <AccountCircleIcon /> },
  { id: 'settings', label: 'Impostazioni', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, open = true, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(`/${path}`);
  };
  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          <Typography variant="h6" component="div" className="font-bold text-gray-800">
            Admin Panel
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeTab === item.id}
              onClick={() => handleNavigation(item.id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                  '&:hover': {
                    backgroundColor: '#bbdefb',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: activeTab === item.id ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: { fontWeight: activeTab === item.id ? 600 : 400 }
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
