import React from 'react';
import { Typography, Box, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { StatCard } from '../components/dashboard/StatCard';
import { DataTable } from '../components/dashboard/DataTable';
import { StatCardData, User, TableColumn } from '../types';

// Dati di esempio
const statsData: StatCardData[] = [
    {
        title: 'Utenti Totali',
        value: '2,847',
        change: 12.5,
        icon: <PeopleIcon />,
        color: 'primary',
    },
    {
        title: 'Vendite Mensili',
        value: '€24,500',
        change: 8.2,
        icon: <AttachMoneyIcon />,
        color: 'success',
    },
    {
        title: 'Ordini',
        value: '1,423',
        change: -2.1,
        icon: <ShoppingCartIcon />,
        color: 'warning',
    },
    {
        title: 'Crescita',
        value: '+15.3%',
        change: 5.4,
        icon: <TrendingUpIcon />,
        color: 'secondary',
    },
];

const recentUsers: User[] = [
    {
        id: 1,
        name: 'Mario Rossi',
        email: 'mario.rossi@email.com',
        status: 'Attivo',
        role: 'Admin',
        lastLogin: '2 ore fa',
    },
    {
        id: 2,
        name: 'Giulia Bianchi',
        email: 'giulia.bianchi@email.com',
        status: 'Attivo',
        role: 'User',
        lastLogin: '5 ore fa',
    },
    {
        id: 3,
        name: 'Luca Verdi',
        email: 'luca.verdi@email.com',
        status: 'Inattivo',
        role: 'User',
        lastLogin: '2 giorni fa',
    },
    {
        id: 4,
        name: 'Anna Neri',
        email: 'anna.neri@email.com',
        status: 'Attivo',
        role: 'Moderator',
        lastLogin: '1 ora fa',
    },
];

const tableColumns: TableColumn[] = [
    { id: 'name', label: 'Nome' },
    { id: 'email', label: 'Email' },
    {
        id: 'status',
        label: 'Status',
        format: (value: string) => (
            <Chip
                label={value}
                color={value === 'Attivo' ? 'success' : 'default'}
                size="small"
            />
        ),
    },
    { id: 'role', label: 'Ruolo' },
    { id: 'lastLogin', label: 'Ultimo Accesso' },
];

export const Dashboard: React.FC = () => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
        }}>
            <Card>
                <CardContent className="!p-4">
                    <Typography variant="h4" className="font-bold text-gray-800">
                        Dashboard Overview
                    </Typography>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(4, 1fr)'
                    },
                    gap: 3,
                }}
            >
                {statsData.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </Box>

            {/* Charts and Tables Section */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        lg: '2fr 1fr'
                    },
                    gap: 3
                }}
            >
                {/* Recent Activity */}
                <Box>
                    <DataTable
                        title="Utenti Recenti"
                        data={recentUsers}
                        columns={tableColumns}
                    />
                </Box>

                {/* Quick Stats */}
                <Box>
                    <Card className="h-full">
                        <CardContent>
                            <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                                Statistiche Rapide
                            </Typography>

                            <Box className="space-y-4">
                                <Box>
                                    <Box className="flex justify-between items-center mb-1">
                                        <Typography variant="body2" className="text-gray-600">
                                            Utenti Attivi
                                        </Typography>
                                        <Typography variant="body2" className="font-semibold">
                                            85%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={85}
                                        className="h-2 rounded-full"
                                        sx={{ backgroundColor: '#e0e0e0' }}
                                    />
                                </Box>

                                <Box>
                                    <Box className="flex justify-between items-center mb-1">
                                        <Typography variant="body2" className="text-gray-600">
                                            Obiettivo Vendite
                                        </Typography>
                                        <Typography variant="body2" className="font-semibold">
                                            72%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={72}
                                        className="h-2 rounded-full"
                                        color="success"
                                    />
                                </Box>

                                <Box>
                                    <Box className="flex justify-between items-center mb-1">
                                        <Typography variant="body2" className="text-gray-600">
                                            Soddisfazione Cliente
                                        </Typography>
                                        <Typography variant="body2" className="font-semibold">
                                            94%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={94}
                                        className="h-2 rounded-full"
                                        color="secondary"
                                    />
                                </Box>

                                <Box className="pt-4 border-t border-gray-200">
                                    <Typography variant="body2" className="text-gray-600 mb-2">
                                        Performance del Sistema
                                    </Typography>
                                    <Box className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <Typography variant="body2" className="text-gray-700">
                                            Tutti i servizi operativi
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
