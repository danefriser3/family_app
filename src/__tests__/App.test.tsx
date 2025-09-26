import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock Apollo hooks globally for App tree to avoid real network
vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  gql: (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join(''),
}))
vi.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: undefined }),
  useMutation: () => [vi.fn()],
  useLazyQuery: () => [vi.fn(), { data: undefined, loading: false, error: undefined }],
}))

import App from '../App'

describe('App', () => {
  it('renders layout and dashboard by default', () => {
    render(<App />)
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
  })
})
