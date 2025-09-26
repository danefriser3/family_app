import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import Sync from '@mui/icons-material/Sync';
import { Card as CardType } from '../../types/graphql';

export interface CardSelectorProps {
  cards?: CardType[];
  selectedCard: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
}

export const CardSelector: React.FC<CardSelectorProps> = ({ cards, selectedCard, onChange, onRefresh }) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <FormControl fullWidth sx={{ maxWidth: 300 }}>
        <InputLabel id="card-select-label">Seleziona Carta</InputLabel>
        <Select
          labelId="card-select-label"
          value={selectedCard}
          onChange={handleChange}
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
          {cards?.map((card) => (
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
      {onRefresh && (
        <IconButton onClick={onRefresh} aria-label="refresh">
          <Sync />
        </IconButton>
      )}
    </Box>
  );
};

export default CardSelector;
