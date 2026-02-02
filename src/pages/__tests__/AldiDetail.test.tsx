import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock MUI Icons
vi.mock('@mui/icons-material', () => {
  const Stub = (props: any) => React.createElement('svg', { 'data-testid': 'mui-icon-stub', ...props })
  return new Proxy({}, { get: () => Stub })
})

const mockUseQuery = vi.fn()

vi.mock('@apollo/client/react', () => ({
  useQuery: (query: any, options: any) => mockUseQuery(query, options),
}))

vi.mock('../graphql/queries', () => ({
  GET_ALDI_PRODUCT_BY_SKU: 'GET_ALDI_PRODUCT_BY_SKU',
}))

// Mock window.location
delete (window as any).location
window.location = { pathname: '/aldi/test-sku', href: '' } as any

import AldiDetail from '../AldiDetail'

describe('AldiDetail', () => {
  beforeEach(() => {
    mockUseQuery.mockClear()
  })

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({ loading: true, data: undefined })
    render(<AldiDetail />)
    expect(screen.getByText('Caricamento...')).toBeInTheDocument()
  })

  it('renders product not found', () => {
    mockUseQuery.mockReturnValue({ loading: false, data: undefined })
    render(<AldiDetail />)
    expect(screen.getByText('Prodotto non trovato')).toBeInTheDocument()
    expect(screen.getByText('Torna alla lista')).toBeInTheDocument()
  })

  it('renders product details', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      data: {
        aldiProduct: {
          id: '1',
          name: 'Test Product',
          sku: 'test-sku',
          category: 'Test Category',
          price: 9.99,
          image: 'http://example.com/image.jpg',
          description: '<p>Test description</p>',
        }
      }
    })
    render(<AldiDetail />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Dettagli Prodotto')).toBeInTheDocument()
    expect(screen.getByText(/test-sku/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Category/i)).toBeInTheDocument()
    expect(screen.getByText(/€9.99/i)).toBeInTheDocument()
  })

  it('renders product without image', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      data: {
        aldiProduct: {
          id: '1',
          name: 'No Image Product',
          sku: 'test-sku',
          category: 'Test',
          price: 5.00,
          image: null,
          description: null,
        }
      }
    })
    render(<AldiDetail />)
    expect(screen.getByText('No Image Product')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
