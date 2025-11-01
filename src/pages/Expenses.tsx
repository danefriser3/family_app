import ExpandedExpenseRow from '../components/dashboard/ExpandedExpenseRow';
import React, { useEffect, useMemo, useState } from 'react';
import { Expense, formatDateYYYYMMDDLocal } from '../types';
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Stack,
    Card,
    CardHeader,
    CardContent,
    Divider,
    Checkbox,
    ButtonGroup
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_CARDS, GET_EXPENSES, GET_INCOMES } from '../graphql/queries';
import { ADD_EXPENSE, DELETE_EXPENSE, DELETE_EXPENSES, UPDATE_CARD } from '../graphql/mutations';
import { Card as CardType } from '../types/graphql';
import CardSelector from '../components/common/CardSelector';
import CardEditorControls from '../components/common/CardEditorControls';
import AddTransactionForm from '../components/common/AddTransactionForm';
import { GetIncomesData } from './Incomes';
export interface GetCardsData {
    cards: CardType[];
}
export interface GetExpensesData {
    expenses: Expense[];
}

// Helper: compute a comparable key for the calendar day (YYYY-MM-DD)
const getDayKey = (d?: string | number): string => {
    const n = Number(d);
    const date = isNaN(n) ? new Date(String(d ?? 0)) : new Date(n);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// Build expense rows with a divider when the day changes
function buildExpenseRows(params: {
    expenses: Expense[];
    selectedCard: string;
    expandedRow: string | null;
    selectedIds: string[];
    onSelect: (id: string) => void;
    onDelete: (id?: string) => void;
    onExpand: (id: string) => void;
    cards?: CardType[];
    sumUpToById: Record<string, number>;
}) {
    const {
        expenses,
        selectedCard,
        expandedRow,
        selectedIds,
        onSelect,
        onDelete,
        onExpand,
        cards,
        sumUpToById
    } = params;
    const nodes: React.ReactNode[] = [];
    let lastDayKey: string | null = null;
    for (const expense of expenses) {
        const currentKey = getDayKey(expense.date);
        const showDivider = lastDayKey !== null && currentKey !== lastDayKey;
        lastDayKey = currentKey;
        if (showDivider) {
            nodes.push(
                <TableRow key={`divider-${expense.id ?? currentKey}-${currentKey}`}>
                    <TableCell colSpan={selectedCard === 'all' ? 7 : 6} sx={{ py: 0.5, background: '#fafafa' }}>
                        <Divider textAlign="left">
                            <Typography variant="caption">{new Date(Number(expense.date)).toLocaleDateString()}</Typography>
                        </Divider>
                    </TableCell>
                </TableRow>
            );
        }
        const creditDeltaAfter = (() => {
            const cardId = expense.card_id ?? selectedCard;
            const card = cards?.find((c: CardType) => c.id === cardId);
            const sumUpTo = expense.id ? sumUpToById[expense.id] ?? 0 : 0;
            return typeof card?.credito_iniziale === 'number' ? Number(card.credito_iniziale) - sumUpTo : undefined;
        })();
        nodes.push(
            <React.Fragment key={expense.id}>
                <ExpandedExpenseRow
                    expense={expense}
                    selectedCard={selectedCard}
                    expanded={expandedRow === expense.id}
                    selected={selectedIds.includes(expense.id ?? '')}
                    onSelect={() => onSelect(expense.id ?? '')}
                    onDelete={() => onDelete(expense.id)}
                    onExpand={() => onExpand(expense.id ?? '')}
                    cards={cards}
                    creditDeltaAfter={creditDeltaAfter}
                />
            </React.Fragment>
        );
    }
    return nodes;
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
        variables: { cardId: selectedCard === 'all' ? null : selectedCard },
        fetchPolicy: 'network-only'
    });
    const { data: incomes } = useQuery<GetIncomesData>(GET_INCOMES, {
        variables: { cardId: selectedCard === 'all' ? undefined : selectedCard },
        fetchPolicy: 'network-only'
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

    // Rank function: extract trailing numeric part of id; fallback to lexicographic
    const idRank = (id?: string): number | string => {
        if (!id) return 0;
        const rx = /(\d+)(?!.*\d)/;
        const m = rx.exec(id); // last number in the string
        const lastDigits = m?.[1];
        if (lastDigits) return Number(lastDigits);
        return id;
    };

    // Precompute cumulative totals per expense id based on id order (lower id considered "precedente")
    // For a given row, sum = expenses with lower id + current.
    const sumUpToById: Record<string, number> = React.useMemo(() => {
        const map: Record<string, number> = {};
        const byCard: Record<string, Expense[]> = {};
        for (const e of getDisplayedExpenses()) {
            const key = String(e.card_id ?? '');
            if (!byCard[key]) byCard[key] = [];
            byCard[key].push(e);
        }
        for (const key of Object.keys(byCard)) {
            const arr = byCard[key].slice().sort((a, b) => {
                const ra = idRank(a.id);
                const rb = idRank(b.id);
                // sort ASC by rank; lowest id first
                if (typeof ra === 'number' && typeof rb === 'number') return ra - rb;
                return String(ra).localeCompare(String(rb));
            });
            let acc = 0;
            for (const e of arr) {
                acc += Number(e.amount || 0); // include current in sum
                const id = e.id;
                if (id) map[id] = acc;
            }
        }
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allExpenses]);

    const renderedExpenseRows = useMemo(() => {
        if (loading || error) return [] as React.ReactNode[];
        return buildExpenseRows({
            expenses: getDisplayedExpenses(),
            selectedCard,
            expandedRow,
            selectedIds,
            onSelect: (id: string) => handleSelect(id),
            onDelete: (id?: string) => handleDeleteExpense(id),
            onExpand: (id: string) => handleExpandRow(id),
            cards: cards?.cards,
            sumUpToById
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, error, allExpenses, selectedCard, expandedRow, selectedIds, cards, sumUpToById]);
    // Funzione per calcolare il totale delle spese
    const getTotalExpenses = (): number => {
        return getDisplayedExpenses().reduce((total, expense) => total + expense.amount, 0);
    };

    const getTotalIncomes = (): number => {
        if (!incomes) return 0;
        return incomes.incomes?.reduce((total, income) => total + income.amount, 0) || 0;
    }

    const getTotalCredito = (): number => {
        const selectedCardObj = selectedCard === 'all' ? undefined : cards?.cards.find((c: CardType) => c.id === selectedCard);
        if (selectedCard === 'all') {
            // Somma tutti i crediti iniziali delle carte
            const totalCreditoIniziale = cards?.cards?.reduce((sum, c) => sum + (c.credito_iniziale || 0), 0) || 0;
            return totalCreditoIniziale - getTotalExpenses() + getTotalIncomes();
        }
        if (!selectedCardObj) return 0;
        return selectedCardObj.credito_iniziale - getTotalExpenses() + getTotalIncomes();
    };

    // Gestione cambio carta (utilizzata da CardSelector)
    const onCardChange = (value: string) => {
        // Aggiorna la carta selezionata; Apollo ricalcolerà la query in base alle variabili.
        setSelectedCard(value);
        // Pulisce selezioni e riga espansa per evitare stati incoerenti tra carte diverse.
        setSelectedIds([]);
        setExpandedRow(null);
        // Pulisce i campi del form di aggiunta spesa per evitare input residui
        setDescription('');
        setAmount('');
        setCategory('');
        setDate('');
        // Reset campi editor carta per evitare valori obsoleti fino al caricamento della nuova carta
        setCredito('');
        setStartDate('');
    };

    // Function to delete an expense by id
    const handleDeleteExpense = (id?: string) => {
        setAllExpenses(prev => prev.filter(expense => expense.id !== id));
        deleteExpense({ variables: { id } });
    };

    // Funzione per aggiungere una nuova spesa
    const handleAddExpense = () => {
        if (!description || !amount || !date || !category || selectedCard === 'all') return;

        const newExpense: Expense = {
            description,
            amount: Number.parseFloat(amount),
            date,
            category,
            card_id: selectedCard === 'all' ? undefined : selectedCard
        };

        setAllExpenses(prev => ([newExpense, ...prev]));

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
                    .map((e: Expense) => e.id)
                    .filter((id: string | undefined): id is string => typeof id === 'string')
                || []
            );
        } else {
            setSelectedIds([]);
        }
    };

    function handleDeleteSelected(): void {
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
    const selectedCardObj = selectedCard === 'all' ? undefined : cards?.cards.find((c: CardType) => c.id === selectedCard);
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
                        <CardSelector
                            cards={cards?.cards}
                            selectedCard={selectedCard}
                            onChange={onCardChange}
                            onRefresh={() => refetch()}
                        />
                    </Stack>

                    <Card className='p-3'>
                        <Typography variant="h6">
                            Riepilogo {selectedCard === 'all' ? 'Tutte le Carte' : selectedCardObj?.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Spese totali: €{getTotalExpenses().toFixed(2)}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Entrate totali: €{getTotalIncomes().toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Credito attuale: €{getTotalCredito().toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Numero spese: {getDisplayedExpenses().length}
                        </Typography>
                        {selectedCardObj && (
                            <CardEditorControls
                                credito={credito}
                                startDate={startDate}
                                onCreditoChange={setCredito}
                                onStartDateChange={setStartDate}
                                onSave={async () => {
                                    await updateCard({ variables: { id: selectedCardObj.id, input: { credito_iniziale: Number(credito), start_date: startDate } } });
                                    setSnackbarOpen(true);
                                }}
                                snackbarOpen={snackbarOpen}
                                setSnackbarOpen={setSnackbarOpen}
                            />
                        )}
                    </Card>
                    {/* Form per aggiungere spese - mostrato solo se una carta specifica è selezionata */}
                    {selectedCard !== 'all' && (
                        <AddTransactionForm
                            title="Aggiungi Spesa"
                            cardName={cards?.cards.find((c: CardType) => c.id === selectedCard)?.name}
                            description={description}
                            amount={amount}
                            category={category}
                            date={date}
                            onDescriptionChange={setDescription}
                            onAmountChange={setAmount}
                            onCategoryChange={setCategory}
                            onDateChange={setDate}
                            onSubmit={handleAddExpense}
                        />
                    )}

                    {<TableContainer component={Paper}>
                        <Stack direction={'column'} spacing={2} sx={{ p: 2 }}>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            {getTotalExpenses() > 0 && !loading && !error && <Checkbox
                                                disabled={getTotalExpenses() === 0 && loading && !!error}
                                                indeterminate={selectedIds.length > 0 && selectedIds.length < ((expenses?.expenses?.length) ?? 0)}
                                                checked={((expenses?.expenses?.length) ?? 0) > 0 && selectedIds.length === ((expenses?.expenses?.length) ?? 0)}
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
                                    {renderedExpenseRows}
                                    {getDisplayedExpenses().length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={selectedCard === 'all' ? 7 : 6} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary" align='center'>
                                                    Nessuna spesa trovata per {selectedCard === 'all' ? 'tutte le carte' : cards?.cards.find((c: CardType) => c.id === selectedCard)?.name}
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