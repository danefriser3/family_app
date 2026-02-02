import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

// Mock MUI Icons before any other imports to prevent EMFILE
vi.mock('@mui/icons-material', () => {
  const Stub = (props: any) => React.createElement('svg', { 'data-testid': 'mui-icon-stub', ...props })
  return new Proxy({}, { get: () => Stub })
})

// Mock Apollo hooks to avoid network
vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  gql: (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join(''),
}))
vi.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: undefined }),
  useMutation: () => [vi.fn()],
  useLazyQuery: () => [vi.fn(), { data: undefined, loading: false, error: undefined }],
}))

// Import after mocks are set up
import App from '../App'

describe('App default branch', () => {
  it('renders App without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })
})
