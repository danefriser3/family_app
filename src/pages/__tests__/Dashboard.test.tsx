import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// ESM-safe mock for Apollo useQuery before importing the component
vi.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: undefined }),
}))

import { Dashboard } from '../Dashboard'

describe('Dashboard', () => {
  it('renders heading and table title', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
    expect(screen.getByText('Utenti Recenti')).toBeInTheDocument()
  })
})
