import React from 'react';
import {
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
    Chip
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Money from '@mui/icons-material/Money';
import { StatCard } from '../components/dashboard/StatCard';
import { DataTable } from '../components/dashboard/DataTable';
import { StatCardData, TableColumn, Expense, User } from '../types';
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
        return { totalExpenses, totalIncomes, totalCreditoIniziale, totalCreditoAttuale, expensesData, incomesData };
};

function parseDateSafe(value?: string) {
    if (!value) return undefined
    // support timestamp string or ISO/date string
    const n = Number(value)
    const d = isNaN(n) ? new Date(value) : new Date(n)
    return isNaN(d.getTime()) ? undefined : d
}

function buildLastMonthsLabels(count = 6) {
    const arr: { key: string; label: string }[] = []
    const now = new Date()
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        d.setMonth(d.getMonth() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleString('it-IT', { month: 'short' }) + ' ' + String(d.getFullYear()).slice(2)
        arr.push({ key, label })
    }
    return arr
}

function aggregateByMonth(items?: Expense[]) {
    const map: Record<string, number> = {}
    if (!items) return map
    for (const it of items) {
        const d = parseDateSafe(it.date)
        if (!d) continue
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        map[key] = (map[key] ?? 0) + (it.amount || 0)
    }
    return map
}

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
        format: (value) => {
            const v = String(value);
            return (
            <Chip
                label={v}
                color={v === 'Attivo' ? 'success' : 'default'}
                size="small"
            />
            );
        },
    },
    { id: 'role', label: 'Ruolo' },
    { id: 'lastLogin', label: 'Ultimo Accesso' },
];


export const Dashboard: React.FC = () => {
    const { totalExpenses, totalIncomes, totalCreditoAttuale, expensesData, incomesData } = useTotals();

    // Build data for small trend chart (last 6 months)
    const months = buildLastMonthsLabels(6)
    const expByMonth = aggregateByMonth(expensesData?.expenses)
    const incByMonth = aggregateByMonth(incomesData?.incomes)
    const xData = months.map(m => m.label)
    const expSeries = months.map(m => +(expByMonth[m.key] ?? 0).toFixed(2))
    const incSeries = months.map(m => +(incByMonth[m.key] ?? 0).toFixed(2))

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
                {/* Trend Entrate/Spese */}
                <Box>
                    <Card className="h-full">
                        <CardContent>
                            <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                                Andamento Entrate/Spese (ultimi 6 mesi)
                            </Typography>
                                                        <LineChart
                                                            height={300}
                                                            xAxis={[{ data: xData, scaleType: 'point' }]}
                                                            series={[
                                                                { data: incSeries, label: 'Entrate', color: '#2e7d32' },
                                                                { data: expSeries, label: 'Spese', color: '#c62828' },
                                                            ]}
                                                            margin={{ left: 40, right: 20, top: 10, bottom: 20 }}
                                                        />
                        </CardContent>
                    </Card>
                </Box>
                {/* Recent Activity */}
                <Box>
                    <DataTable
                        title="Utenti Recenti"
                        data={recentUsers as unknown as Record<string, unknown>[]}
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
