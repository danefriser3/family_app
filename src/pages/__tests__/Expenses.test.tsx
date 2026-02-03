import { vi } from 'vitest'
import { render, screen, within, waitFor, fireEvent, act } from '@testing-library/react'
import React from 'react'

// Mock Apollo core utilities
vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  gql: (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join(''),
}))

// Provide recognizable document tokens for easier matching
vi.mock('../../graphql/queries', () => ({
  GET_EXPENSES: 'GET_EXPENSES',
  GET_CARDS: 'GET_CARDS',
  GET_INCOMES: 'GET_INCOMES',
}))

vi.mock('../../graphql/mutations', () => ({
  ADD_EXPENSE: 'ADD_EXPENSE',
  ADD_INCOME: 'ADD_INCOME',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  DELETE_EXPENSES: 'DELETE_EXPENSES',
  UPDATE_CARD: 'UPDATE_CARD',
}))

// Lightweight mock for the complex row component used by Expenses table
vi.mock('../../components/dashboard/ExpandedExpenseRow', () => ({
  default: ({ expense }: { expense: { description?: string } }) => (
    <tr data-testid="expense-row"><td>{expense.description ?? 'exp'}</td></tr>
  )
}))

// Dynamic data the hooks will return
const mocks = {
  cards: [
    { id: 'c1', name: 'One', color: '#f00', credito_iniziale: 100, start_date: '2025-01-01' },
    { id: 'c2', name: 'Two', color: '#0f0', credito_iniziale: 200, start_date: '2025-01-01' },
  ],
  expenses: [] as Array<{ id?: string; description: string; amount: number; date: string; category?: string; card_id?: string }>,
  incomes: [] as Array<{ id?: string; description: string; amount: number; date: string; category?: string; card_id?: string }>,
  refetch: vi.fn(),
  addExpense: vi.fn().mockResolvedValue({}),
  addIncome: vi.fn().mockResolvedValue({}),
  deleteExpense: vi.fn().mockResolvedValue({}),
  deleteExpenses: vi.fn().mockResolvedValue({}),
  updateCard: vi.fn().mockResolvedValue({}),
}

vi.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) => {
    if (doc === 'GET_EXPENSES' || (typeof doc === 'string' && doc.includes('query') && doc.includes('expenses'))) {
      return { data: { expenses: mocks.expenses }, loading: false, error: undefined, refetch: mocks.refetch }
    }
    if (doc === 'GET_CARDS' || (typeof doc === 'string' && doc.includes('query') && doc.includes('cards'))) {
      return { data: { cards: mocks.cards }, loading: false, error: undefined, refetch: vi.fn() }
    }
    if (doc === 'GET_INCOMES' || (typeof doc === 'string' && doc.includes('query') && doc.includes('incomes'))) {
      return { data: { incomes: mocks.incomes }, loading: false, error: undefined, refetch: vi.fn() }
    }
    return { data: {}, loading: false, error: undefined, refetch: vi.fn() }
  },
  useMutation: (doc: unknown) => {
    if (doc === 'ADD_EXPENSE') return [mocks.addExpense]
    if (doc === 'ADD_INCOME') return [mocks.addIncome]
    if (doc === 'DELETE_EXPENSE') return [mocks.deleteExpense]
    if (doc === 'DELETE_EXPENSES') return [mocks.deleteExpenses]
    if (doc === 'UPDATE_CARD') return [mocks.updateCard]
    return [vi.fn()]
  },
  useLazyQuery: () => [vi.fn(), { data: undefined, loading: false, error: undefined }] as const,
}))

import Expenses from '../Expenses'

describe('Expenses', () => {
  beforeEach(() => {
    mocks.expenses = []
    mocks.incomes = []
    mocks.refetch.mockClear()
    mocks.addExpense.mockClear()
    mocks.addIncome.mockClear()
    mocks.deleteExpense.mockClear()
    mocks.deleteExpenses.mockClear()
    mocks.updateCard.mockClear()
  })

  it('renders title and empty state', () => {
    render(<Expenses />)
    expect(screen.getByText('Gestione Spese')).toBeInTheDocument()
    expect(screen.getByText(/Riepilogo/)).toBeInTheDocument()
    expect(screen.getByText(/Nessuna spesa trovata/)).toBeInTheDocument()
  })

  it('selects a specific card, shows form, adds an expense and updates totals', async () => {
    // Start with no expenses; switch to specific card to render the form
    render(<Expenses />)
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('One')) })

    // Form visible
    expect(await screen.findByText(/Aggiungi Spesa/)).toBeInTheDocument()

    // Fill fields
    const desc = screen.getByRole('textbox', { name: /Descrizione/ })
    const amount = screen.getByRole('spinbutton', { name: /Importo/ })
    const category = screen.getByRole('textbox', { name: /Categoria/ })
    // There are two date inputs: one in CardEditorControls (Data Inizio) and one in the form (Data)
    const startDateInput = screen.getByLabelText('Data Inizio')
    const dateInputs = Array.from(document.querySelectorAll('input[type="date"]'))
    const dateInput = dateInputs.find((el) => el !== startDateInput) as HTMLInputElement | undefined
    expect(dateInput).toBeTruthy()
    await act(async () => {
      fireEvent.change(desc, { target: { value: 'Biglietto' } })
      fireEvent.change(amount, { target: { value: '12.5' } })
      fireEvent.change(category, { target: { value: 'Trasporti' } })
      fireEvent.change(dateInput as Element, { target: { value: '2025-09-30' } })
    })

    // Add
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Aggiungi' })) })
    // Mutation called with proper variables
    await waitFor(() => expect(mocks.addExpense).toHaveBeenCalled())
    const calledVars = mocks.addExpense.mock.calls[0][0]?.variables
    expect(calledVars).toBeTruthy()
    expect(calledVars.expenseInput).toMatchObject({
      description: 'Biglietto',
      amount: 12.5,
      category: 'Trasporti',
      date: '1759190400000',
      card_id: 'c1',
    })

    // Inputs cleared after submit
    await waitFor(() => {
      expect((desc as HTMLInputElement).value).toBe('')
      expect((amount as HTMLInputElement).value).toBe('')
      expect((category as HTMLInputElement).value).toBe('')
      expect((dateInput as HTMLInputElement).value).toBe('')
    })
  })

  it('header checkbox selects all and bulk delete triggers deleteExpenses with ids', async () => {
    // Provide two expenses and switch to All (default) so header checkbox appears
    const day = Date.UTC(2025, 8, 27)
    mocks.expenses = [
      { id: 'e1', description: 'A', amount: 5, date: String(day), category: 'x', card_id: 'c1' },
      { id: 'e2', description: 'B', amount: 7, date: String(day), category: 'y', card_id: 'c2' },
    ]

    render(<Expenses />)
    // Ensure totals > 0 to render header checkbox
    expect(screen.getByText(/Spese totali: €12\.00/)).toBeInTheDocument()
    const headerCheckbox = screen.getAllByRole('checkbox')[0]
    await act(async () => { fireEvent.click(headerCheckbox) })

    // Elimina button appears and works
    const deleteBtn = await screen.findByRole('button', { name: 'Elimina' })
    await act(async () => { fireEvent.click(deleteBtn) })
    await waitFor(() => expect(mocks.deleteExpenses).toHaveBeenCalledWith({ variables: { ids: ['e1', 'e2'] } }))
  })

  it('updates card settings and shows success snackbar', async () => {
    // Select specific card to render CardEditorControls
    render(<Expenses />)
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('One')) })

    // Click Salva to trigger updateCard and open snackbar
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salva' })) })
    await waitFor(() => expect(mocks.updateCard).toHaveBeenCalled())
    // Snackbar message
    expect(await screen.findByText('Modifiche salvate!')).toBeInTheDocument()
  })

  it('header checkbox toggle off clears selection and hides bulk delete', async () => {
    const day = Date.UTC(2025, 8, 27)
    mocks.expenses = [
      { id: 'e1', description: 'A', amount: 5, date: String(day), category: 'x', card_id: 'c1' },
    ]
    render(<Expenses />)
    const headerCheckbox = screen.getAllByRole('checkbox')[0]
    // Select all
    await act(async () => { fireEvent.click(headerCheckbox) })
    expect(await screen.findByRole('button', { name: 'Elimina' })).toBeInTheDocument()
    // Unselect all
    await act(async () => { fireEvent.click(headerCheckbox) })
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Elimina' })).not.toBeInTheDocument()
    })
  })

  it('changing card clears form fields (onCardChange)', async () => {
    render(<Expenses />)
    // Select first card to show form
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('One')) })
    // Fill a couple fields
    const desc = await screen.findByRole('textbox', { name: /Descrizione/ })
    const amount = screen.getByRole('spinbutton', { name: /Importo/ })
    await act(async () => {
      fireEvent.change(desc, { target: { value: 'temp' } })
      fireEvent.change(amount, { target: { value: '1' } })
    })
    // Switch to another card
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox2 = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox2).getByText('Two')) })
    // Fields cleared
    await waitFor(() => {
      expect((desc as HTMLInputElement).value).toBe('')
      expect((amount as HTMLInputElement).value).toBe('')
    })
  })

  it('renders a date divider between different days (covers lines with day change logic)', async () => {
    // Two expenses on different calendar days to trigger the divider branch
    const day1 = Date.UTC(2025, 8, 27) // 2025-09-27 UTC ms
    const day2 = Date.UTC(2025, 8, 28) // 2025-09-28 UTC ms
    mocks.expenses = [
      { id: 'e1', description: 'Pranzo', amount: 10, date: String(day1), category: 'Food', card_id: 'c1' },
      { id: 'e2', description: 'Cena', amount: 20, date: String(day2), category: 'Food', card_id: 'c1' },
    ]

    render(<Expenses />)

    // Table body should contain: 1 divider row + 2 expense rows
    const table = await screen.findByRole('table')
    const tbody = table.querySelector('tbody') as HTMLElement
    await waitFor(() => {
      const rows = within(tbody).getAllByRole('row')
      expect(rows.length).toBe(3)
    })
  })
})
