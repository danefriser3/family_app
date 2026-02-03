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

vi.mock('@mui/material/styles', async () => {
  const actual = await vi.importActual('@mui/material/styles')
  return {
    ...actual,
    useTheme: () => ({ breakpoints: { down: () => false } })
  }
})

vi.mock('@mui/material/useMediaQuery', () => ({
  default: () => false
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

    const mockFileReader = {
      readAsText: vi.fn(function(this: any) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: this._content } })
          }
        }, 0)
      }),
      _content: ''
    }
    global.FileReader = vi.fn(() => mockFileReader) as any
  })

  it('renders title and empty state', () => {
    render(<Expenses />)
    expect(screen.getByText('Gestione Spese')).toBeInTheDocument()
    expect(screen.getByText(/Riepilogo/)).toBeInTheDocument()
    expect(screen.getByText(/Nessuna spesa trovata/)).toBeInTheDocument()
  })

  it('selects a specific card, shows form, adds an expense and updates totals', async () => {
    render(<Expenses />)
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('One')) })

    expect(await screen.findByText(/Aggiungi Spesa/)).toBeInTheDocument()

    const desc = screen.getByRole('textbox', { name: /Descrizione/ })
    const amount = screen.getByRole('spinbutton', { name: /Importo/ })
    const category = screen.getByRole('textbox', { name: /Categoria/ })
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

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Aggiungi' })) })
    await waitFor(() => expect(mocks.addExpense).toHaveBeenCalled())
  })

  it('header checkbox selects all and bulk delete triggers deleteExpenses with ids', async () => {
    const day = Date.UTC(2025, 8, 27)
    mocks.expenses = [
      { id: 'e1', description: 'A', amount: 5, date: String(day), category: 'x', card_id: 'c1' },
      { id: 'e2', description: 'B', amount: 7, date: String(day), category: 'y', card_id: 'c2' },
    ]

    render(<Expenses />)
    expect(screen.getByText(/Spese totali: €12\.00/)).toBeInTheDocument()
    const headerCheckbox = screen.getAllByRole('checkbox')[0]
    await act(async () => { fireEvent.click(headerCheckbox) })

    const deleteBtn = await screen.findByRole('button', { name: 'Elimina' })
    await act(async () => { fireEvent.click(deleteBtn) })
    await waitFor(() => expect(mocks.deleteExpenses).toHaveBeenCalledWith({ variables: { ids: ['e1', 'e2'] } }))
  })

  it('updates card settings and shows success snackbar', async () => {
    render(<Expenses />)
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('One')) })

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salva' })) })
    await waitFor(() => expect(mocks.updateCard).toHaveBeenCalled())
    expect(await screen.findByText('Modifiche salvate!')).toBeInTheDocument()
  })

  it('header checkbox toggle off clears selection and hides bulk delete', async () => {
    const day = Date.UTC(2025, 8, 27)
    mocks.expenses = [
      { id: 'e1', description: 'A', amount: 5, date: String(day), category: 'x', card_id: 'c1' },
    ]
    render(<Expenses />)
    const headerCheckbox = screen.getAllByRole('checkbox')[0]
    await act(async () => { fireEvent.click(headerCheckbox) })
    expect(await screen.findByRole('button', { name: 'Elimina' })).toBeInTheDocument()
    await act(async () => { fireEvent.click(headerCheckbox) })
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Elimina' })).not.toBeInTheDocument()
    })
  })

  it('changing card clears form fields (onCardChange)', async () => {
    render(<Expenses />)
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('One')) })
    const desc = await screen.findByRole('textbox', { name: /Descrizione/ })
    const amount = screen.getByRole('spinbutton', { name: /Importo/ })
    await act(async () => {
      fireEvent.change(desc, { target: { value: 'temp' } })
      fireEvent.change(amount, { target: { value: '1' } })
    })
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox2 = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox2).getByText('Two')) })
    await waitFor(() => {
      expect((desc as HTMLInputElement).value).toBe('')
      expect((amount as HTMLInputElement).value).toBe('')
    })
  })

  it('renders a date divider between different days', async () => {
    const day1 = Date.UTC(2025, 8, 27)
    const day2 = Date.UTC(2025, 8, 28)
    mocks.expenses = [
      { id: 'e1', description: 'Pranzo', amount: 10, date: String(day1), category: 'Food', card_id: 'c1' },
      { id: 'e2', description: 'Cena', amount: 20, date: String(day2), category: 'Food', card_id: 'c1' },
    ]

    render(<Expenses />)

    const table = await screen.findByRole('table')
    const tbody = table.querySelector('tbody') as HTMLElement
    await waitFor(() => {
      const rows = within(tbody).getAllByRole('row')
      expect(rows.length).toBe(3)
    })
  })

  it('uploads CSV with negative amounts as expenses', async () => {
    const csvContent = 'header\n,,2025-09-27 10:00,desc,-10.5,extra'
    global.FileReader = vi.fn().mockImplementation(function(this: any) {
      this.readAsText = vi.fn(function(this: any) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: csvContent } })
          }
        }, 0)
      })
    }) as any

    render(<Expenses />)
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('One')) })

    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeTruthy()
    
    await act(async () => {
      Object.defineProperty(input, 'files', { value: [file], writable: false })
      fireEvent.change(input)
    })

    await waitFor(() => {
      expect(screen.queryByText('Conferma Importazione')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const confirmBtn = screen.getByText('Conferma Importazione')
    await act(async () => { fireEvent.click(confirmBtn) })

  })
})
