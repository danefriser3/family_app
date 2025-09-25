import React from 'react';
import { Stack, TextField, Button, Card, CardHeader, CardContent, Divider, Typography } from '@mui/material';

export interface AddTransactionFormProps {
  title: string;
  description: string;
  amount: string;
  category: string;
  date: string;
  onDescriptionChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onSubmit: () => void;
  cardName?: string;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  title,
  description,
  amount,
  category,
  date,
  onDescriptionChange,
  onAmountChange,
  onCategoryChange,
  onDateChange,
  onSubmit,
  cardName,
}) => {
  return (
    <Card>
      <CardHeader title={<Typography variant="h6">{title}{cardName ? ` a ${cardName}` : ''}</Typography>} />
      <Divider />
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Descrizione"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            required
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Importo (€)"
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            required
            size="small"
            sx={{ minWidth: 120 }}
          />
          <TextField
            label="Categoria"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            required
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Data"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
            size="small"
            sx={{ minWidth: 150 }}
          />
          <Button onClick={onSubmit} variant="contained" size="small">
            Aggiungi
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AddTransactionForm;
