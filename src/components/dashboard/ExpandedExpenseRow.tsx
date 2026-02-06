import React, { useEffect, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { GET_EXPENSE_PRODUCTS } from '../../graphql/queries';
import { ADD_EXPENSE_PRODUCT } from '../../graphql/mutations';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TextField,
  Button,
  Snackbar,
  Alert,
  Slide,
  Card,
  CardHeader,
  CardContent,
  Stack,
  Divider,
  Checkbox,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Remove from '@mui/icons-material/Remove';
import { Expense } from '../../types';

// Tipi per prodotti associati alle spese
interface ExpenseProduct {
  id: string;
  name: string;
  quantity: number;
  note: string;
  price: number;
  item_type?: string;
  scadenza: string;
}
interface GetExpenseProductsData {
  expenseProducts: ExpenseProduct[];
}

// Nessuna funzione wrapper: usiamo slots/slotProps direttamente su Snackbar

interface Card {
  id: string;
  name: string;
  color: string;
}

interface ExpandedExpenseRowProps {
  expense: Expense;
  selectedCard: string;
  expanded: boolean;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onExpand: () => void;
  cards?: Card[];
  // Differenza tra credito iniziale e somma delle spese con id inferiore più quella attuale
  creditDeltaAfter?: number;
}

const ExpandedExpenseRow: React.FC<ExpandedExpenseRowProps> = ({ expense, selectedCard, expanded, selected, onSelect, onDelete, onExpand, cards, creditDeltaAfter }) => {
  const colSpan = selectedCard === 'all' ? 7 : 6;
  const [products, setProducts] = useState<ExpenseProduct[]>([]);
  const [newProduct, setNewProduct] = useState<Pick<ExpenseProduct, 'name' | 'quantity' | 'price' | 'note' | 'item_type' | 'scadenza'>>({ name: '', quantity: 1, price: 0, note: '', item_type: 'Altro', scadenza: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [getExpenseProducts, { data: productsData, loading: loadingProducts }] = useLazyQuery<GetExpenseProductsData>(GET_EXPENSE_PRODUCTS, { fetchPolicy: 'network-only' });
  const [addExpenseProduct] = useMutation(ADD_EXPENSE_PRODUCT);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Esegui la query solo quando expanded passa da false a true
  // Esegui la query solo una volta per ogni expense espansa
  const fetchedRef = useRef<{ [key: string]: boolean }>({});
  useEffect(() => {
    const expenseKey = String(expense.id);
    if (expanded && expenseKey && !fetchedRef.current[expenseKey]) {
      getExpenseProducts({ variables: { expenseId: expense.id } });
      fetchedRef.current[expenseKey] = true;
    }
    // eslint-disable-next-line
  }, [expanded, expense.id]);

  useEffect(() => {
    if (productsData?.expenseProducts) {
      setProducts(productsData.expenseProducts);
    }
  }, [productsData]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.quantity || !newProduct.price) return;
    const totalProducts = products.reduce((sum: number, prod: ExpenseProduct) => sum + Number(prod.price), 0);
    const newTotal = totalProducts + Number(newProduct.price);
    if (expense && newTotal > expense.amount) {
      setSnackbarOpen(true);
      return;
    }
    await addExpenseProduct({
      variables: {
        expenseId: expense.id,
        product: {
          name: newProduct.name,
          quantity: Number(newProduct.quantity),
          price: Number(newProduct.price),
          note: newProduct.note,
          item_type: newProduct.item_type,
          scadenza: newProduct.scadenza
        }
      }
    });
    setNewProduct({ name: '', quantity: 1, price: 0, note: '', item_type: '', scadenza: '' });
    // Dopo aggiunta prodotto, rilancia la query
    getExpenseProducts({ variables: { expenseId: expense.id } });
  };

  const handleShowAddProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAddProduct(p => !p);
  };

  return (
    <>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        slots={{ transition: Slide }}
        slotProps={{ transition: { direction: 'left' } }}
      >
        <Alert severity="warning" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          Il totale dei prodotti supera il prezzo della spesa!
        </Alert>
      </Snackbar>

      <TableRow
        hover
        onClick={onExpand}
        style={{ cursor: 'pointer', background: expanded ? '#f5f5f5' : undefined }}
        title={
          creditDeltaAfter === undefined
            ? undefined
            : `Disponibile tenendo conto delle spese con id inferiore + questa: € ${creditDeltaAfter.toFixed(2)}`
        }
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={e => { e.stopPropagation(); onSelect(); }}
          />
        </TableCell>
        <TableCell>{expense.description}</TableCell>
        <TableCell align="center">{expense.category}</TableCell>
        <TableCell align="right">€ {expense.amount.toFixed(2)}</TableCell>
        <TableCell align="center">{new Date(Number(expense.date)).toLocaleDateString()}</TableCell>
        {selectedCard === 'all' && (
          <TableCell align="center">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: cards?.find(c => c.id === expense.card_id)?.color
                  }}
                />
                <Typography variant="body2">{cards?.find(c => c.id === expense.card_id)?.name}</Typography>
              </Box>
            </Box>
          </TableCell>
        )}
        <TableCell align="right">
          <IconButton onClick={e => { e.stopPropagation(); onDelete(); }}>
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={colSpan} sx={{ background: '#fafafa', p: 2 }}>
            {loadingProducts ? (
              <Typography variant="body2">Caricamento prodotti...</Typography>
            ) : (
              <Stack direction="column" spacing={2}>
                <Card>
                  <CardHeader title="Prodotti associati" action={
                    <IconButton onClick={handleShowAddProduct}>
                      {showAddProduct ? <Remove /> : <Add />}
                    </IconButton>
                  } />
                  <Divider />
                  {showAddProduct && (
                    <>
                      <CardContent>
                        <Box
                          component="form"
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            width: '100%',
                          }}
                          onSubmit={handleAddProduct}
                        >
                          <TextField
                            label="Nome prodotto"
                            size="small"
                            required
                            name="name"
                            value={newProduct.name}
                            onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                            fullWidth
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            label="Nota"
                            size="small"
                            name="note"
                            value={newProduct.note}
                            onChange={e => setNewProduct(p => ({ ...p, note: e.target.value }))}
                            fullWidth
                            sx={{ flexGrow: 1 }}
                          />
                          <FormControl fullWidth >
                            <InputLabel id="item-type-select-label">Tipo</InputLabel>
                            <Select
                              size="small"
                              labelId="item-type-select-label"
                              id="item-type-select"
                              value={newProduct.item_type}
                              label="Tipo"
                              onChange={e => setNewProduct(p => ({ ...p, item_type: e.target.value }))}
                              fullWidth
                              sx={{ flexGrow: 1 }}
                            >
                              <MenuItem value={'Altro'}>Altro</MenuItem>
                              <MenuItem value={'Alimentare'}>Alimentare</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            label="Scadenza"
                            type="date"
                            value={newProduct.scadenza}
                            onChange={(e) => setNewProduct(p => ({ ...p, scadenza: e.target.value }))}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 150 }}
                          />
                          <TextField
                            label="Quantità"
                            size="small"
                            type="number"
                            required
                            name="quantity"
                            value={newProduct.quantity}
                            onChange={e => setNewProduct(p => ({ ...p, quantity: Number(e.target.value) }))}
                            fullWidth
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            label="Prezzo (€)"
                            size="small"
                            type="number"
                            required
                            name="price"
                            value={newProduct.price}
                            onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))}
                            fullWidth
                            sx={{ flexGrow: 1 }}
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            sx={{ flexShrink: 0, minWidth: 160 }}
                          >
                            Aggiungi prodotto
                          </Button>
                        </Box>
                      </CardContent>
                      <Divider />
                    </>
                  )}
                  <CardContent>
                    <Stack direction="column" spacing={2}>

                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Nota</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Scadenza</TableCell>
                            <TableCell>Quantità</TableCell>
                            <TableCell>Prezzo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {products.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Typography variant="body2" padding={2} color="text.secondary" textAlign={'center'}>Nessun prodotto associato</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                          {products.map((prod: ExpenseProduct) => (
                            <TableRow key={prod.id}>
                              <TableCell>{prod.name}</TableCell>
                              <TableCell>{prod.note}</TableCell>
                              <TableCell>{prod.item_type ? prod.item_type : 'Altro'}</TableCell>
                              <TableCell>{prod.scadenza ? new Date(parseInt(prod.scadenza)).toLocaleDateString() : ''}</TableCell>
                              <TableCell>{prod.quantity}</TableCell>
                              <TableCell>€ {prod.price}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={5} align="right"><strong>Totale Prodotti:</strong></TableCell>
                            <TableCell><strong>€ {products.reduce((sum, prod) => sum + prod.price, 0).toFixed(2)}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Stack>
                  </CardContent>
                </Card>
                {/* Form per aggiungere prodotto */}
              </Stack>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ExpandedExpenseRow;
