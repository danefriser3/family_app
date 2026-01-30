import React, { useEffect, useState } from 'react';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Stack,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Checkbox,
  ButtonGroup,
  Box
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_CARDS, GET_INCOMES } from '../graphql/queries';
import { ADD_INCOME, DELETE_INCOME, DELETE_INCOMES, UPDATE_CARD } from '../graphql/mutations';
import Delete from '@mui/icons-material/Delete';
import { Expense as Income, formatDateYYYYMMDDLocal } from '../types';
import { GetCardsData, GetIncomesData } from '../types/graphql';
import CardSelector from '../components/common/CardSelector';
import CardEditorControls from '../components/common/CardEditorControls';
import AddTransactionForm from '../components/common/AddTransactionForm';

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

  const onCardChange = (value: string) => {
    setSelectedCard(value);
    // Clear selections and form fields on card change to avoid stale UI
    setSelectedIds([]);
    setDescription('');
    setAmount('');
    setCategory('');
    setDate('');
    // Reset editor fields to avoid stale values until the new card data loads
    setCredito('');
    setStartDate('');
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
        incomeInput: {
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
              Entrate totali: €{getTotalIncomes().toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Numero entrate: {getDisplayedIncomes().length}
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
          {selectedCard !== 'all' && (
            <AddTransactionForm
              title="Aggiungi Entrata"
              cardName={cards?.cards.find(c => c.id === selectedCard)?.name}
              description={description}
              amount={amount}
              category={category}
              date={date}
              onDescriptionChange={setDescription}
              onAmountChange={setAmount}
              onCategoryChange={setCategory}
              onDateChange={setDate}
              onSubmit={handleAddIncome}
            />
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
                        {selectedCard === 'all' && (
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: cards?.cards.find(c => c.id === income.card_id)?.color
                                  }}
                                />
                                <Typography variant="body2">{cards?.cards.find(c => c.id === income.card_id)?.name}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        )}
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
