import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

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

// Mock Layout so it triggers an unknown tab to exercise the default branch
vi.mock('../components/layout/Layout', () => ({
  Layout: ({ onTabChange, children }: { onTabChange: (tab: string) => void; children: React.ReactNode }) => {
    React.useEffect(() => {
      onTabChange('unknown-tab')
    }, [onTabChange])
    return <div data-testid="mock-layout">{children}</div>
  },
}))

// Import after mocks are set up
import App from '../App'

describe('App default branch', () => {
  it('renders Dashboard via default branch when tab is unknown', () => {
    render(<App />)
    // If default executed, we still see the dashboard content
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
  })
})
