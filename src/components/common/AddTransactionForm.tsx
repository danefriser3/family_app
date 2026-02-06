import React from 'react';
import { Stack, TextField, Button, Card, CardHeader, CardContent, Divider, Typography } from '@mui/material';
import UploadFile from '@mui/icons-material/UploadFile';

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
  onCsvUpload?: (file: File) => void;
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
  onCsvUpload,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCsvUpload) {
      onCsvUpload(file);
    }
  };

  return (
    <Card data-cy="add-transaction-form">
      <CardHeader title={<Typography variant="h6">{title}{cardName ? ` a ${cardName}` : ''}</Typography>} />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Descrizione"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              required
              name="description"
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Importo (€)"
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              required
              name="amount"
              size="small"
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Categoria"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              required
              name="category"
              size="small"
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Data"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              required
              name="date"
              size="small"
              sx={{ minWidth: 150 }}
              InputLabelProps={{ shrink: true }}
            />
            <Button onClick={onSubmit} variant="contained" size="small">
              Aggiungi
            </Button>
          </Stack>
          {onCsvUpload && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFile />}
                size="small"
              >
                Carica CSV
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Formato: CSV bancario (Descrizione, Importo, Data)
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AddTransactionForm;
