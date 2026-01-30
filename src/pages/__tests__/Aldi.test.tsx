import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock MUI Icons before any other imports to prevent EMFILE
vi.mock('@mui/icons-material', () => {
  const Stub = (props: any) => React.createElement('svg', { 'data-testid': 'mui-icon-stub', ...props })
  return new Proxy({}, { get: () => Stub })
})

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}))

vi.mock('../graphql/queries', () => ({
  GET_ALDI_PRODUCTS: 'GET_ALDI_PRODUCTS',
}))

import Aldi from '../Aldi'
import { useQuery } from '@apollo/client/react'

const mockUseQuery = useQuery as any

describe('Aldi', () => {
  it('renders with products', () => {
    mockUseQuery.mockReturnValue({
      data: {
        aldiProducts: [
          { id: '1', name: 'Pasta', price: 1.99 },
          { id: '2', name: 'Pane', price: 0.89 },
        ]
      }
    })

    render(<Aldi />)
    expect(screen.getByText('Prodotti Aldi')).toBeInTheDocument()
    expect(screen.getByText('Elenco Prodotti 2')).toBeInTheDocument()
    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(screen.getByText('€ 1.99')).toBeInTheDocument()
  })

  it('renders without data', () => {
    mockUseQuery.mockReturnValue({ data: undefined })

    render(<Aldi />)
    expect(screen.getByText('Prodotti Aldi')).toBeInTheDocument()
    expect(screen.getByText('Elenco Prodotti')).toBeInTheDocument()
  })
})