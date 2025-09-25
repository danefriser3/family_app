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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  AccountCircle as AccountCircleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { SidebarProps, MenuItem } from '../../types';

const drawerWidth = 240;

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'expenses', label: 'Spese', icon: <BarChartIcon /> },
  { id: 'incomes', label: 'Entrate', icon: <AttachMoneyIcon /> },
  { id: 'users', label: 'Utenti', icon: <PeopleIcon /> },
  { id: 'inventory', label: 'Inventario', icon: <InventoryIcon /> },
  { id: 'reports', label: 'Report', icon: <AssessmentIcon /> },
  { id: 'profile', label: 'Profilo', icon: <AccountCircleIcon /> },
  { id: 'settings', label: 'Impostazioni', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
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
              onClick={() => onTabChange(item.id)}
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
