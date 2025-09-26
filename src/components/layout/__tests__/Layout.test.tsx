import { render, screen } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'

vi.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
import { Layout } from '../Layout'

describe('Layout', () => {
  it('renders children inside main area', () => {
    render(
      <Layout activeTab="dashboard" onTabChange={() => {}}>
        <div>Child Content</div>
      </Layout>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })
})
