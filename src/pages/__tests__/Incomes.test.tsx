import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  gql: (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join(''),
}))

const stableQueryResult = { data: { cards: [], incomes: [] }, loading: false, error: undefined, refetch: vi.fn() }
const stableLazyResult = [vi.fn(), { data: undefined, loading: false, error: undefined }] as const
vi.mock('@apollo/client/react', () => ({
  useQuery: () => stableQueryResult,
  useMutation: () => [vi.fn()],
  useLazyQuery: () => stableLazyResult,
}))

import Incomes from '../Incomes'

describe('Incomes', () => {
  it('renders title and empty state', () => {
    render(<Incomes />)
    expect(screen.getByText('Gestione Entrate')).toBeInTheDocument()
    expect(screen.getByText(/Riepilogo/)).toBeInTheDocument()
    expect(screen.getByText(/Nessuna entrata trovata/)).toBeInTheDocument()
  })
})
