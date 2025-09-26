import { render, screen, fireEvent } from '@testing-library/react'
import { CardEditorControls } from '../CardEditorControls'

describe('CardEditorControls', () => {
  it('calls change handlers and save, shows snackbar', () => {
    const onCreditoChange = vi.fn()
    const onStartDateChange = vi.fn()
    const onSave = vi.fn()
    const setSnackbarOpen = vi.fn()

    render(
      <CardEditorControls
        credito="100"
        startDate="2025-01-01"
        onCreditoChange={onCreditoChange}
        onStartDateChange={onStartDateChange}
        onSave={onSave}
        snackbarOpen={true}
        setSnackbarOpen={setSnackbarOpen}
      />
    )

    fireEvent.change(screen.getByLabelText(/Credito Iniziale/i, { exact: false }), { target: { value: '150' } })
    fireEvent.change(screen.getByLabelText(/Data Inizio/i, { exact: false }), { target: { value: '2025-02-01' } })
    fireEvent.click(screen.getByRole('button', { name: /Salva/i }))

    expect(onCreditoChange).toHaveBeenCalledWith('150')
    expect(onStartDateChange).toHaveBeenCalledWith('2025-02-01')
    expect(onSave).toHaveBeenCalled()
  })
})
