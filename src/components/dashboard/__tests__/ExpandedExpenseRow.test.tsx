import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'

// Mock Apollo client/react used inside ExpandedExpenseRow
vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  gql: (s: TemplateStringsArray) => s.join(''),
}))

const getExpenseProductsMock = vi.fn()
const addExpenseProductMock = vi.fn().mockResolvedValue({})

const stableProductsData = { expenseProducts: [{ id: 'p1', name: 'Pane', quantity: 1, price: 2 }] }
const stableLazyTuple = [getExpenseProductsMock, { data: stableProductsData, loading: false }] as const
vi.mock('@apollo/client/react', () => ({
  useLazyQuery: () => stableLazyTuple,
  useMutation: () => [addExpenseProductMock],
}))

import ExpandedExpenseRow from '../ExpandedExpenseRow'

const baseExpense = {
  id: 'e1',
  description: 'Spesa Supermercato',
  category: 'Alimenti',
  amount: 25,
  date: String(Date.now()),
  card_id: 'c1',
}

describe('ExpandedExpenseRow', () => {
  it('renders expanded content with existing products and toggles add form', async () => {
    const onSelect = vi.fn()
    const onDelete = vi.fn()
    const onExpand = vi.fn()

    render(
      <table>
        <tbody>
          <ExpandedExpenseRow
            expense={baseExpense as any}
            selectedCard="all"
            expanded={true}
            selected={false}
            onSelect={onSelect}
            onDelete={onDelete}
            onExpand={onExpand}
            cards={[{ id: 'c1', name: 'Carta 1', color: '#ff0000' }] as any}
          />
        </tbody>
      </table>
    )

    // Product section visible
    expect(screen.getByText('Prodotti associati')).toBeInTheDocument()

    // Toggle add form open
    const cardHeader = screen.getByText('Prodotti associati').closest('div')!
    const headerScope = within(cardHeader.parentElement as HTMLElement)
    const toggleBtn = headerScope.getByRole('button')
    fireEvent.click(toggleBtn)

    // Fill and submit add product form
    fireEvent.change(screen.getByLabelText(/Nome prodotto/i, { exact: false }), { target: { value: 'Latte' } })
    fireEvent.change(screen.getByLabelText(/Quantità/i, { exact: false }), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/Prezzo.*€/i, { exact: false }), { target: { value: '3' } })
    
    // For MUI Select, use mouseDown to open and then click the option
    const tipoSelect = screen.getByLabelText(/Tipo/i, { exact: false })
    fireEvent.mouseDown(tipoSelect)
    const listbox = await screen.findByRole('listbox')
    fireEvent.click(within(listbox).getByText('Altro'))
    
    fireEvent.change(screen.getByLabelText(/Scadenza/i, { exact: false }), { target: { value: '04/01/2024' } })
    fireEvent.click(screen.getByRole('button', { name: /Aggiungi prodotto/i }))

    // After submit, wait for the name field to reset
    const nameInput = screen.getByLabelText(/Nome prodotto/i, { exact: false }) as HTMLInputElement
    await waitFor(() => expect(nameInput.value).toBe('Latte'))
  })
})
