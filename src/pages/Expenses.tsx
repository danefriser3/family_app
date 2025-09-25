import ExpandedExpenseRow from '../components/dashboard/ExpandedExpenseRow';
import React, { useEffect, useState } from 'react';
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
    IconButton,
    Checkbox,
    ButtonGroup,
    Snackbar,
    Alert,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_CARDS, GET_EXPENSES } from '../graphql/queries';
import { ADD_EXPENSE, DELETE_EXPENSE, DELETE_EXPENSES, UPDATE_CARD } from '../graphql/mutations';
import { Sync } from '@mui/icons-material';
import { Card as CardType } from '../types/graphql';
import { formatDateYYYYMMDDLocal } from '../types';
export interface GetCardsData {
    cards: CardType[];
}
export interface GetExpensesData {
    expenses: Expense[];
}

const Expenses: React.FC = () => {
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
    const [selectedCard, setSelectedCard] = useState<string>('all');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);


    const { data: cards } = useQuery<GetCardsData>(GET_CARDS);
    const { data: expenses, loading, error, refetch } = useQuery<GetExpensesData>(GET_EXPENSES, {
        variables: { cardId: selectedCard === 'all' ? null : selectedCard }
    });
    const [deleteExpense] = useMutation(DELETE_EXPENSE);

    const [deleteExpenses] = useMutation(DELETE_EXPENSES);

    const [addExpense] = useMutation(ADD_EXPENSE);
    const [updateCard] = useMutation(UPDATE_CARD);


    useEffect(() => {
        if (expenses) {
            setAllExpenses(expenses.expenses);
        }
    }, [expenses]);

    // Stato per la riga espansa
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const handleExpandRow = (expenseId: string) => {
        setExpandedRow(expandedRow === expenseId ? null : expenseId);
    };
    useEffect(() => {
        setAllExpenses(expenses?.expenses || []);
    }, [expenses, cards]);

    // Funzione per ottenere le spese da visualizzare
    const getDisplayedExpenses = (): Expense[] => {
        return allExpenses || [];
    };

    // Funzione per calcolare il totale delle spese
    const getTotalExpenses = (): number => {
        return getDisplayedExpenses().reduce((total, expense) => total + expense.amount, 0);
    };

    // Gestione cambio carta
    const handleCardChange = (event: SelectChangeEvent) => {
        setSelectedCard(event.target.value);
        refetch({ cardId: event.target.value === 'all' ? null : event.target.value })
    };

    // Function to delete an expense by id
    const handleDeleteExpense = (id?: string) => {
        setAllExpenses(prev => prev.filter(expense => expense.id !== id));
        deleteExpense({ variables: { id } });
    };

    // Funzione per aggiungere una nuova spesa
    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date || !category || selectedCard === 'all') return;

        const newExpense: Expense = {
            description,
            amount: Number.parseFloat(amount),
            date,
            category,
            card_id: selectedCard === 'all' ? undefined : selectedCard
        };

        setAllExpenses(prev => ([...prev, newExpense]));

        addExpense({ variables: { expenseInput: newExpense } });

        setDescription('');
        setAmount('');
        setDate('');
        setCategory('');
    };

    const handleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedIds(
                expenses?.expenses
                    .map((e) => e.id)
                    .filter((id): id is string => typeof id === 'string')
                || []
            );
        } else {
            setSelectedIds([]);
        }
    };

    function handleDeleteSelected(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        // Delete all selected expenses
        const idsToDelete = selectedIds;
        if (idsToDelete.length === 0) return;

        // Optimistically update UI
        setAllExpenses(prev => prev.filter(expense => !idsToDelete.includes(expense.id ?? '')));

        deleteExpenses({ variables: { ids: idsToDelete } });
        // Clear selection
        setSelectedIds([]);
    }

    // Stato per modifica carta selezionata
    const selectedCardObj = selectedCard !== 'all' ? cards?.cards.find(c => c.id === selectedCard) : undefined;
    const [credito, setCredito] = useState('');
    const [startDate, setStartDate] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    useEffect(() => {
        setCredito(String(selectedCardObj?.credito_iniziale ?? ''));
        setStartDate(formatDateYYYYMMDDLocal(selectedCardObj?.start_date));
    }, [selectedCardObj]);

    return (
        <Card>
            <CardHeader title={<Typography variant="h4" gutterBottom>
                Gestione Spese
            </Typography>} />
            <Divider />
            <CardContent>
                <Stack direction="column" spacing={3}>
                    <Stack direction="row">
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
                                {cards?.cards.map((card) => (
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
                        <IconButton onClick={() => {
                            refetch();
                        }}>
                            <Sync />
                        </IconButton>
                    </Stack>

                    <Card className='p-3'>
                        <Typography variant="h6">
                            Riepilogo {selectedCard === 'all' ? 'Tutte le Carte' : selectedCardObj?.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Spese totali: €{getTotalExpenses().toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Numero spese: {getDisplayedExpenses().length}
                        </Typography>
                        {selectedCardObj && (
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
                                <TextField
                                    label="Credito Iniziale (€)"
                                    type="number"
                                    size="small"
                                    value={credito}
                                    onChange={e => setCredito(e.target.value)}
                                    sx={{ minWidth: 120 }}
                                />
                                <TextField
                                    label="Data Inizio"
                                    type="date"
                                    size="small"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ minWidth: 150 }}
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={async () => {
                                        await updateCard({ variables: { id: selectedCardObj.id, input: { credito_iniziale: Number(credito), start_date: startDate } } });
                                        setSnackbarOpen(true);
                                    }}
                                >
                                    Salva
                                </Button>
                                <Snackbar
                                    open={snackbarOpen}
                                    autoHideDuration={3000}
                                    onClose={() => setSnackbarOpen(false)}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <Alert severity="success" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
                                        Modifiche salvate!
                                    </Alert>
                                </Snackbar>
                            </Stack>
                        )}
                    </Card>
                    {/* Form per aggiungere spese - mostrato solo se una carta specifica è selezionata */}
                    {selectedCard !== 'all' && (
                        <Card>
                            <CardHeader title={<Typography variant="h6">
                                Aggiungi Spesa a {cards?.cards.find(c => c.id === selectedCard)?.name}
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

                    {<TableContainer component={Paper}>
                        <Stack direction={'column'} spacing={2} sx={{ p: 2 }}>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            {getTotalExpenses() > 0 && !loading && !error && <Checkbox
                                                disabled={getTotalExpenses() === 0 && loading && !!error}
                                                indeterminate={selectedIds?.length > 0 && selectedIds?.length < expenses?.expenses?.length!}
                                                checked={expenses?.expenses?.length! > 0 && selectedIds?.length === expenses?.expenses?.length}
                                                onChange={handleSelectAll}
                                            />}
                                        </TableCell>
                                        <TableCell>Descrizione</TableCell>
                                        <TableCell align="center">Categoria</TableCell>
                                        <TableCell align="right">Importo (€)</TableCell>
                                        <TableCell align="center">Data</TableCell>
                                        {selectedCard === 'all' && <TableCell align="center">Carta</TableCell>}
                                        <TableCell align="right">Azioni</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!loading && !error &&
                                        getDisplayedExpenses().map((expense: Expense) => (
                                            <React.Fragment key={expense.id}>
                                                <ExpandedExpenseRow
                                                    expense={expense}
                                                    selectedCard={selectedCard}
                                                    expanded={expandedRow === expense.id}
                                                    selected={selectedIds.includes(expense.id ?? '')}
                                                    onSelect={() => handleSelect(expense.id ?? '')}
                                                    onDelete={() => handleDeleteExpense(expense.id)}
                                                    onExpand={() => handleExpandRow(expense.id ?? '')}
                                                    cards={cards?.cards}
                                                />
                                            </React.Fragment>
                                        ))
                                    }
                                    {getDisplayedExpenses().length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={selectedCard === 'all' ? 7 : 6} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary" align='center'>
                                                    Nessuna spesa trovata per {selectedCard === 'all' ? 'tutte le carte' : cards?.cards.find(c => c.id === selectedCard)?.name}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {selectedIds.length > 0 && (
                                <ButtonGroup>
                                    <Button
                                        size='small'
                                        color="error"
                                        onClick={handleDeleteSelected}
                                        disabled={selectedIds.length === 0}
                                    >
                                        Elimina
                                    </Button>
                                </ButtonGroup>
                            )}
                        </Stack>
                    </TableContainer>}
                </Stack>
            </CardContent>
        </Card >
    );
};

export default Expenses;