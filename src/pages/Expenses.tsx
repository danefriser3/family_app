import React, { useState } from 'react';
import { Expense } from '../types';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Card,
    CardHeader,
    CardContent,
    Divider,
} from '@mui/material';

// Definizione delle carte
interface Card {
    id: string;
    name: string;
    color: string;
}

const cards: Card[] = [
    { id: 'card1', name: 'N26', color: '#1976d2' },
    { id: 'card2', name: 'Revolut', color: '#388e3c' },
    { id: 'card3', name: 'Hype', color: '#f57c00' },
];

// Spese iniziali per ogni carta
const initialExpenses: Record<string, Expense[]> = {
    card1: [
        { id: 1, description: 'Spesa alimentare', amount: 50, date: '2024-06-01', category: 'Alimentari' },
        { id: 2, description: 'Farmacia', amount: 25, date: '2024-06-02', category: 'Salute' },
    ],
    card2: [
        { id: 3, description: 'Benzina', amount: 40, date: '2024-06-01', category: 'Trasporti' },
        { id: 4, description: 'Pranzo', amount: 15, date: '2024-06-03', category: 'Ristorazione' },
    ],
    card3: [
        { id: 5, description: 'Bolletta luce', amount: 80, date: '2024-06-01', category: 'Utilities' },
        { id: 6, description: 'Bolletta gas', amount: 60, date: '2024-06-02', category: 'Utilities' },
    ],
};

const Expenses: React.FC = () => {
    const [allExpenses, setAllExpenses] = useState<Record<string, Expense[]>>(initialExpenses);
    const [selectedCard, setSelectedCard] = useState<string>('all');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');

    // Funzione per ottenere le spese da visualizzare
    const getDisplayedExpenses = (): Expense[] => {
        if (selectedCard === 'all') {
            return Object.values(allExpenses).flat();
        }
        return allExpenses[selectedCard] || [];
    };

    // Funzione per calcolare il totale delle spese
    const getTotalExpenses = (): number => {
        return getDisplayedExpenses().reduce((total, expense) => total + expense.amount, 0);
    };

    // Gestione cambio carta
    const handleCardChange = (event: SelectChangeEvent) => {
        setSelectedCard(event.target.value);
    };

    // Funzione per aggiungere una nuova spesa
    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date || !category || selectedCard === 'all') return;

        const newExpense: Expense = {
            id: Date.now(), // Usiamo timestamp come ID temporaneo
            description,
            amount: parseFloat(amount),
            date,
            category,
        };

        setAllExpenses(prev => ({
            ...prev,
            [selectedCard]: [...(prev[selectedCard] || []), newExpense],
        }));

        setDescription('');
        setAmount('');
        setDate('');
        setCategory('');
    };

    return (
        <Card>
            <CardHeader title={<Typography variant="h4" gutterBottom>
                Gestione Spese
            </Typography>} />
            <Divider />
            <CardContent>
                <Stack direction="column" spacing={3}>
                    <FormControl fullWidth sx={{ maxWidth: 300 }}>
                        <InputLabel id="card-select-label">Seleziona Carta</InputLabel>
                        <Select
                            labelId="card-select-label"
                            value={selectedCard}
                            onChange={handleCardChange}
                            label="Seleziona Carta"
                            size="small"
                        >
                            <MenuItem value="all">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(45deg, #1976d2, #388e3c, #f57c00)'
                                        }}
                                    />
                                    Tutte le Carte
                                </Box>
                            </MenuItem>
                            {cards.map((card) => (
                                <MenuItem key={card.id} value={card.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                backgroundColor: card.color
                                            }}
                                        />
                                        {card.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Card className='p-3'>
                        <Typography variant="h6">
                            Riepilogo {selectedCard === 'all' ? 'Tutte le Carte' : cards.find(c => c.id === selectedCard)?.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Spese totali: €{getTotalExpenses().toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Numero spese: {getDisplayedExpenses().length}
                        </Typography>
                    </Card>
                    {/* Form per aggiungere spese - mostrato solo se una carta specifica è selezionata */}
                    {selectedCard !== 'all' && (
                        <Card>
                            <CardHeader title={<Typography variant="h6">
                                Aggiungi Spesa a {cards.find(c => c.id === selectedCard)?.name}
                            </Typography>} />
                            <Divider />
                            <CardContent>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="Descrizione"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                        size="small"
                                        sx={{ minWidth: 200 }}
                                    />
                                    <TextField
                                        label="Importo (€)"
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        required
                                        size="small"
                                        inputProps={{ min: 0, step: 0.01 }}
                                        sx={{ minWidth: 120 }}
                                    />
                                    <TextField
                                        label="Categoria"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        required
                                        size="small"
                                        sx={{ minWidth: 150 }}
                                    />
                                    <TextField
                                        label="Data"
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ minWidth: 150 }}
                                    />
                                    <Button onClick={handleAddExpense} variant="contained" size="small">
                                        Aggiungi
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Descrizione</TableCell>
                                    <TableCell align="center">Categoria</TableCell>
                                    <TableCell align="right">Importo (€)</TableCell>
                                    <TableCell align="center">Data</TableCell>
                                    {selectedCard === 'all' && <TableCell align="center">Carta</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getDisplayedExpenses().map((expense: Expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell align="center">{expense.category}</TableCell>
                                        <TableCell align="right">€{expense.amount.toFixed(2)}</TableCell>
                                        <TableCell align="center">{expense.date}</TableCell>
                                        {selectedCard === 'all' && (
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    {Object.entries(allExpenses).map(([cardId, cardExpenses]) => {
                                                        const card = cards.find(c => c.id === cardId);
                                                        if (cardExpenses.some(e => e.id === expense.id) && card) {
                                                            return (
                                                                <Box key={cardId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 8,
                                                                            height: 8,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: card.color
                                                                        }}
                                                                    />
                                                                    <Typography variant="body2">{card.name}</Typography>
                                                                </Box>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {getDisplayedExpenses().length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={selectedCard === 'all' ? 5 : 4} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                Nessuna spesa trovata per {selectedCard === 'all' ? 'tutte le carte' : cards.find(c => c.id === selectedCard)?.name}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default Expenses;