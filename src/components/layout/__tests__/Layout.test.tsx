import { render, screen } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Mock MUI Icons before any other imports to prevent EMFILE
vi.mock('@mui/icons-material', () => {
  const Stub = (props: any) => React.createElement('svg', { 'data-testid': 'mui-icon-stub', ...props })
  return new Proxy({}, { get: () => Stub })
})

vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
import { Layout } from '../Layout'

describe('Layout', () => {
  it('renders children inside main area', () => {
    render(
      <BrowserRouter>
        <Layout activeTab="dashboard">
          <div>Child Content</div>
        </Layout>
      </BrowserRouter>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })
})
