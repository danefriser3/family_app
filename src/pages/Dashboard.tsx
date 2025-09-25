import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import {
    AttachMoney as AttachMoneyIcon,
    ShoppingCart as ShoppingCartIcon,
    Money,
} from '@mui/icons-material';
import { StatCard } from '../components/dashboard/StatCard';
import { DataTable } from '../components/dashboard/DataTable';
import { StatCardData, User, TableColumn, Expense } from '../types';
import { useQuery } from '@apollo/client/react';
import { GET_CARDS, GET_EXPENSES, GET_INCOMES } from '../graphql/queries';
import { Card as CardType } from '../types/graphql';

const useTotals = () => {
    const { data: expensesData } = useQuery<{ expenses: Expense[] }>(GET_EXPENSES, { variables: { cardId: null } });
    const { data: incomesData } = useQuery<{ incomes: Expense[] }>(GET_INCOMES, { variables: { cardId: null } });
    const { data: cardsData } = useQuery<{ cards: CardType[] }>(GET_CARDS, { variables: {} });
    const totalExpenses = expensesData?.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const totalIncomes = incomesData?.incomes?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
    const totalCreditoIniziale = cardsData?.cards?.reduce((sum, c) => sum + (c.credito_iniziale || 0), 0) || 0;
    const totalCreditoAttuale = totalCreditoIniziale + totalIncomes - totalExpenses;
    return { totalExpenses, totalIncomes, totalCreditoIniziale, totalCreditoAttuale };
};

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
    const { totalExpenses, totalIncomes, totalCreditoAttuale } = useTotals();

    const statsData: StatCardData[] = [
        {
            title: 'Credito totale',
            value: `€ ${totalCreditoAttuale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
            icon: <Money />, // puoi cambiare icona se vuoi
            color: 'error',
        },
        {
            title: 'Totale Spese',
            value: `€ ${totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
            icon: <ShoppingCartIcon />, // puoi cambiare icona se vuoi
            color: 'error',
        },
        {
            title: 'Totale Entrate',
            value: `€ ${totalIncomes.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
            icon: <AttachMoneyIcon />,
            color: 'success',
        },
    ];

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
                    <StatCard key={stat.title + '-' + index} {...stat} />
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
