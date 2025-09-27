import { vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react'
import React from 'react'

// Mock Apollo gql to return a recognizable string
vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  gql: (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join(''),
}))

// Mock GraphQL documents as simple tokens to make matching deterministic
vi.mock('../../graphql/mutations', () => ({
  ADD_INCOME: 'ADD_INCOME',
  DELETE_INCOME: 'DELETE_INCOME',
  DELETE_INCOMES: 'DELETE_INCOMES',
  UPDATE_CARD: 'UPDATE_CARD',
}))
vi.mock('../../graphql/queries', () => ({
  GET_INCOMES: 'GET_INCOMES',
  GET_CARDS: 'GET_CARDS',
}))

// Dynamic mocks for hooks
const mocks = {
  cards: [
    { id: '1', name: 'Visa', color: '#f00', credito_iniziale: 0, start_date: '2025-01-01' },
    { id: '2', name: 'MasterCard', color: '#0f0', credito_iniziale: 0, start_date: '2025-01-01' },
  ],
  incomes: [
    { id: 'i1', description: 'Stipendio', amount: 1000, date: String(Date.now()), category: 'Lavoro', card_id: '1' },
    { id: 'i2', description: 'Bonus', amount: 200, date: String(Date.now()), category: 'Lavoro', card_id: '2' },
  ] as Array<{ id?: string; description: string; amount: number; date: string; category: string; card_id?: string }>,
  refetch: vi.fn(),
  addIncome: vi.fn().mockResolvedValue({}),
  deleteIncome: vi.fn().mockResolvedValue({}),
  deleteIncomes: vi.fn().mockResolvedValue({}),
  updateCard: vi.fn().mockResolvedValue({}),
}

let mutationIndex = 0
vi.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown, _options?: any) => {
    if (doc === 'GET_INCOMES' || (typeof doc === 'string' && doc.includes('query Incomes'))) {
      return { data: { incomes: mocks.incomes }, loading: false, error: undefined, refetch: mocks.refetch }
    }
    if (doc === 'GET_CARDS' || (typeof doc === 'string' && doc.includes('query') && doc.includes('cards'))) {
      return { data: { cards: mocks.cards }, loading: false, error: undefined, refetch: vi.fn() }
    }
    return { data: {}, loading: false, error: undefined, refetch: vi.fn() }
  },
  useMutation: (doc: unknown) => {
    if (doc === 'ADD_INCOME') return [mocks.addIncome]
    if (doc === 'DELETE_INCOME') return [mocks.deleteIncome]
    if (doc === 'DELETE_INCOMES') return [mocks.deleteIncomes]
    if (doc === 'UPDATE_CARD') return [mocks.updateCard]
    // Fallback to call-order for unexpected docs
    const fns = [mocks.addIncome, mocks.deleteIncome, mocks.deleteIncomes, mocks.updateCard]
    const fn = fns[mutationIndex] || vi.fn()
    mutationIndex += 1
    return [fn]
  },
  useLazyQuery: () => [vi.fn(), { data: undefined, loading: false, error: undefined }] as const,
}))

import Incomes from '../Incomes'

describe('Incomes', () => {
  beforeEach(() => {
    mutationIndex = 0
    mocks.refetch.mockClear()
    mocks.addIncome.mockClear()
    mocks.deleteIncome.mockClear()
    mocks.deleteIncomes.mockClear()
    mocks.updateCard.mockClear()
    // Reset data per test if mutated
    mocks.incomes = [
      { id: 'i1', description: 'Stipendio', amount: 1000, date: String(Date.now()), category: 'Lavoro', card_id: '1' },
      { id: 'i2', description: 'Bonus', amount: 200, date: String(Date.now()), category: 'Lavoro', card_id: '2' },
    ]
  })

  it('renders list, totals, and empty form when all cards selected', () => {
    render(<Incomes />)
    expect(screen.getByText('Gestione Entrate')).toBeInTheDocument()
    // Totals for all incomes
    expect(screen.getByText(/Entrate totali: €1200\.00/)).toBeInTheDocument()
    expect(screen.getByText(/Numero entrate: 2/)).toBeInTheDocument()
    // When "all" is selected, form to add income is hidden
    expect(screen.queryByText('Aggiungi Entrata')).not.toBeInTheDocument()
    // Two rows rendered
    expect(screen.getAllByRole('row')).toHaveLength(1 /* header */ + 2 /* rows */ + 0 /* footer */)
  })

  it('filters by selected card and allows adding a new income (calls mutation with incomeInput)', async () => {
  render(<Incomes />)
    // Open the MUI Select and choose "Visa"
    const select = screen.getByLabelText('Seleziona Carta')
    await act(async () => { fireEvent.mouseDown(select) })
    const listbox = await screen.findByRole('listbox')
    await act(async () => { fireEvent.click(within(listbox).getByText('Visa')) })

  // Form should be visible now (title includes card name)
  expect(await screen.findByText(/Aggiungi Entrata/)).toBeInTheDocument()

  // Fill form fields (MUI TextField: use role-based queries)
  const desc = screen.getByRole('textbox', { name: /Descrizione/ })
  const amount = screen.getByRole('spinbutton', { name: /Importo/ })
  const category = screen.getByRole('textbox', { name: /Categoria/ })
  // Pick the AddTransactionForm date input by excluding the card editor's "Data Inizio"
  const startDateInput = screen.getByLabelText('Data Inizio')
  const dateInputs = Array.from(document.querySelectorAll('input[type="date"]'))
  const dateInput = dateInputs.find((el) => el !== startDateInput) || null
  expect(desc && amount && category && dateInput).toBeTruthy()
  await act(async () => {
    fireEvent.change(desc, { target: { value: 'Rimborso' } })
    fireEvent.change(amount, { target: { value: '50' } })
    fireEvent.change(category, { target: { value: 'Extra' } })
    fireEvent.change(dateInput as Element, { target: { value: '2025-09-27' } })
  })
  // Assert values flushed (and thus parent state updated)
  await waitFor(() => {
    expect((desc as HTMLInputElement).value).toBe('Rimborso')
    expect((amount as HTMLInputElement).value).toBe('50')
    expect((category as HTMLInputElement).value).toBe('Extra')
    expect((dateInput as HTMLInputElement).value).toBe('2025-09-27')
  })

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Aggiungi' })) })

  // Assert mutation variables use the expected name
  await waitFor(() => expect(mocks.addIncome).toHaveBeenCalled())
    const vars = mocks.addIncome.mock.calls[0][0]?.variables
    expect(vars).toBeTruthy()
    expect(vars.incomeInput).toMatchObject({
      description: 'Rimborso',
      amount: 50,
      category: 'Extra',
      date: '2025-09-27',
    })

    // refetch called after add
    expect(mocks.refetch).toHaveBeenCalled()
  })

  it('select all and bulk delete triggers DeleteIncomes with visible ids', async () => {
    render(<Incomes />)

    // Switch to specific card to make header checkbox enabled and select only matching rows
    const select = screen.getByLabelText('Seleziona Carta')
    fireEvent.mouseDown(select)
    const listbox = await screen.findByRole('listbox')
    fireEvent.click(within(listbox).getByText('Visa')) // card_id = '1' => only i1 is displayed

    // Click header checkbox to select all displayed rows
  const headerCheckbox = screen.getAllByRole('checkbox')[0]
  await act(async () => { fireEvent.click(headerCheckbox) })

    // Elimina button appears
  const deleteBtn = await screen.findByRole('button', { name: 'Elimina' })
  await act(async () => { fireEvent.click(deleteBtn) })

  await waitFor(() => expect(mocks.deleteIncomes).toHaveBeenCalledWith({ variables: { ids: ['i1'] } }))
  })
})
