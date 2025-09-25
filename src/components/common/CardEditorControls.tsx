import React from 'react';
import { Stack, TextField, Button, Snackbar, Alert } from '@mui/material';

export interface CardEditorControlsProps {
  credito: string;
  startDate: string;
  onCreditoChange: (v: string) => void;
  onStartDateChange: (v: string) => void;
  onSave: () => Promise<void> | void;
  snackbarOpen: boolean;
  setSnackbarOpen: (open: boolean) => void;
}

export const CardEditorControls: React.FC<CardEditorControlsProps> = ({
  credito,
  startDate,
  onCreditoChange,
  onStartDateChange,
  onSave,
  snackbarOpen,
  setSnackbarOpen,
}) => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
      <TextField
        label="Credito Iniziale (€)"
        type="number"
        size="small"
        value={credito}
        onChange={(e) => onCreditoChange(e.target.value)}
        sx={{ minWidth: 120 }}
      />
      <TextField
        label="Data Inizio"
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        sx={{ minWidth: 150 }}
      />
      <Button variant="contained" size="small" onClick={() => onSave()}>
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
  );
};

export default CardEditorControls;
