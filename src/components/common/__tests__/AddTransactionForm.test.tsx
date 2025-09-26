import { render, screen, fireEvent } from '@testing-library/react'
import { AddTransactionForm } from '../AddTransactionForm'

describe('AddTransactionForm', () => {
  it('renders inputs and calls handlers', () => {
    const onDescriptionChange = vi.fn();
    const onAmountChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onDateChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <AddTransactionForm
        title="Aggiungi Spesa"
        description=""
        amount=""
        category=""
        date="2025-01-01"
        onDescriptionChange={onDescriptionChange}
        onAmountChange={onAmountChange}
        onCategoryChange={onCategoryChange}
        onDateChange={onDateChange}
        onSubmit={onSubmit}
      />
    );

  // MUI adds an asterisk and special spacing to required labels; use regex and exact: false
  fireEvent.change(screen.getByLabelText(/Descrizione/i, { exact: false }), { target: { value: 'Pane' } });
  fireEvent.change(screen.getByLabelText(/Importo.*€/i, { exact: false }), { target: { value: '3.50' } });
  fireEvent.change(screen.getByLabelText(/Categoria/i, { exact: false }), { target: { value: 'Alimenti' } });
  fireEvent.change(screen.getByLabelText(/Data/i, { exact: false }), { target: { value: '2025-01-02' } });
    fireEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(onDescriptionChange).toHaveBeenCalledWith('Pane');
    expect(onAmountChange).toHaveBeenCalledWith('3.50');
    expect(onCategoryChange).toHaveBeenCalledWith('Alimenti');
    expect(onDateChange).toHaveBeenCalledWith('2025-01-02');
    expect(onSubmit).toHaveBeenCalled();
  });
});
