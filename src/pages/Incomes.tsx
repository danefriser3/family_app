import React, { useEffect, useState } from 'react';
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
  Alert
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_CARDS, GET_INCOMES } from '../graphql/queries';
import { ADD_INCOME, DELETE_INCOME, DELETE_INCOMES, UPDATE_CARD } from '../graphql/mutations';
import { Delete, Sync } from '@mui/icons-material';
import { Expense as Income, formatDateYYYYMMDDLocal } from '../types';
import { Card as CardType } from '../types/graphql';
import { GetCardsData } from './Expenses';

export interface GetIncomesData {
    incomes: Income[];
}

const Incomes = () => {
  const [selectedCard, setSelectedCard] = useState<string>('all');
  const { data: cards } = useQuery<GetCardsData>(GET_CARDS);
  const { data: incomes, refetch, loading, error } = useQuery<GetIncomesData>(GET_INCOMES, {
    variables: { cardId: selectedCard === 'all' ? undefined : selectedCard },
    fetchPolicy: 'network-only'
  });
  const [addIncome] = useMutation(ADD_INCOME);
  const [deleteIncome] = useMutation(DELETE_INCOME);
  const [deleteIncomes] = useMutation(DELETE_INCOMES);
  const [updateCard] = useMutation(UPDATE_CARD);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [credito, setCredito] = useState('');
  const [startDate, setStartDate] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const selectedCardObj = selectedCard === 'all' ? undefined : cards?.cards.find(c => c.id === selectedCard);

  useEffect(() => {
    setCredito(String(selectedCardObj?.credito_iniziale ?? ''));
    setStartDate(formatDateYYYYMMDDLocal(selectedCardObj?.start_date));
  }, [selectedCardObj]);

  const handleCardChange = (event: SelectChangeEvent<string>) => {
    setSelectedCard(event.target.value);
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = getDisplayedIncomes().map(income => income.id!);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleAddIncome = async () => {
    if (!description || !amount || !category || !date) return;
    await addIncome({
      variables: {
        input: {
          description,
          amount: Number(amount),
          category,
          date,
          card_id: selectedCard === 'all' ? undefined : selectedCard
        }
      }
    });
    refetch();
    setDescription('');
    setAmount('');
    setCategory('');
    setDate('');
  };

  const handleDeleteIncome = async (id?: string) => {
    await deleteIncome({ variables: { id } });
    refetch();
  };

  const handleDeleteSelected = async () => {
    await deleteIncomes({ variables: { ids: selectedIds } });
    setSelectedIds([]);
    refetch();
  };

  const getTotalIncomes = () => {
    return incomes?.incomes?.reduce((total: number, income: Income) => total + income.amount, 0) ?? 0;
  };

  const getDisplayedIncomes: () => Income[] = () => {
    return incomes?.incomes?.filter((income: Income) => {
      if (selectedCard === 'all') return true;
      return income.card_id === selectedCard;
    }) ?? [];
  };

  return (
    <Card>
      <CardHeader title={<Typography variant="h4" gutterBottom>
        Gestione Entrate
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
                {cards?.cards.map((card: CardType) => (
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
              Entrate totali: €{getTotalIncomes().toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Numero entrate: {getDisplayedIncomes().length}
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
          {selectedCard !== 'all' && (
            <Card>
              <CardHeader title={<Typography variant="h6">
                Aggiungi Entrata a {cards?.cards.find(c => c.id === selectedCard)?.name}
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
                  <Button onClick={handleAddIncome} variant="contained" size="small">
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
                      {getTotalIncomes() > 0 && !loading && !error && <Checkbox
                        disabled={getTotalIncomes() === 0 && loading && !!error}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < ((incomes?.incomes?.length) ?? 0)}
                        checked={((incomes?.incomes?.length) ?? 0) > 0 && selectedIds.length === ((incomes?.incomes?.length) ?? 0)}
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
                    getDisplayedIncomes().map((income: Income) => (
                      <TableRow key={income.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIds.includes(income.id ?? '')}
                            onChange={() => handleSelect(income.id ?? '')}
                          />
                        </TableCell>
                        <TableCell>{income.description}</TableCell>
                        <TableCell align="center">{income.category}</TableCell>
                        <TableCell align="right">€{income.amount.toFixed(2)}</TableCell>
                        <TableCell align="center">{new Date(Number(income.date)).toLocaleDateString()}</TableCell>
                        {selectedCard === 'all' && <TableCell align="center">{cards?.cards.find((c: CardType) => c.id === income.card_id)?.name}</TableCell>}
                        <TableCell align="right">
                          <IconButton onClick={() => handleDeleteIncome(income.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                  {getDisplayedIncomes().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={selectedCard === 'all' ? 7 : 6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary" align='center'>
                          Nessuna entrata trovata per {selectedCard === 'all' ? 'tutte le carte' : cards?.cards.find(c => c.id === selectedCard)?.name}
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

export default Incomes;
