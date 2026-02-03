import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Money from '@mui/icons-material/Money';
import { StatCard } from '../components/dashboard/StatCard';
import { StatCardData, Expense } from '../types';
import { useQuery } from '@apollo/client/react';
import { GET_CARDS, GET_EXPENSES, GET_INCOMES } from '../graphql/queries';
import { Card as CardType } from '../types/graphql';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

const useTotals = () => {
    const { data: expensesData } = useQuery<{ expenses: Expense[] }>(GET_EXPENSES, { variables: { cardId: null } });
    const { data: incomesData } = useQuery<{ incomes: Expense[] }>(GET_INCOMES, { variables: { cardId: null } });
    const { data: cardsData } = useQuery<{ cards: CardType[] }>(GET_CARDS, { variables: {} });
    const totalExpenses = expensesData?.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const totalIncomes = incomesData?.incomes?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
    const totalCreditoIniziale = cardsData?.cards?.reduce((sum, c) => sum + (c.credito_iniziale || 0), 0) || 0;
    const totalCreditoAttuale = totalCreditoIniziale + totalIncomes - totalExpenses;

    const expensesByDay = expensesData?.expenses?.reduce((acc, e) => {
        const timestamp = Number(e.date);
        const day = new Date(timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        if (!acc[day]) acc[day] = { total: 0, timestamp };
        acc[day].total += e.amount;
        return acc;
    }, {} as Record<string, { total: number; timestamp: number }>) || {};

    const incomesByDay = incomesData?.incomes?.reduce((acc, i) => {
        const timestamp = Number(i.date);
        const day = new Date(timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        if (!acc[day]) acc[day] = { total: 0, timestamp };
        acc[day].total += i.amount;
        return acc;
    }, {} as Record<string, { total: number; timestamp: number }>) || {};

    const allDays = Array.from(new Set([...Object.keys(expensesByDay), ...Object.keys(incomesByDay)]));
    const chartData = allDays
        .map(day => ({
            day,
            spese: Number((expensesByDay[day]?.total || 0).toFixed(2)) || null,
            entrate: Number((incomesByDay[day]?.total || 0).toFixed(2)) || null,
            timestamp: expensesByDay[day]?.timestamp || incomesByDay[day]?.timestamp || 0
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    return { totalExpenses, totalIncomes, totalCreditoIniziale, totalCreditoAttuale, chartData: chartData.slice(-30) };
};



export const Dashboard: React.FC = () => {
    const { totalExpenses, totalIncomes, totalCreditoAttuale, chartData } = useTotals();

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

            {/* Charts Section */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        lg: 'repeat(2, 1fr)'
                    },
                    gap: 3
                }}
            >
                <Card>
                    <CardContent>
                        <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                            Spese per Giorno
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis scale="log" domain={['auto',  'dataMax + 5000']} allowDataOverflow />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="spese" fill="#f44336" name="Spese (€)" barSize={20} />
                                <Line type="monotone" dataKey="spese" stroke="#d32f2f" strokeWidth={2} dot={false} name="Trend Spese" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6" className="font-semibold text-gray-800 mb-4">
                            Entrate per Giorno
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis scale="log" domain={['auto', 'dataMax + 5000']} allowDataOverflow />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="entrate" fill="#4caf50" name="Entrate (€)" barSize={20} />
                                <Line type="monotone" dataKey="entrate" stroke="#1b5e20" strokeWidth={3} dot={{ fill: '#1b5e20', r: 4 }} name="Trend Entrate" connectNulls />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
