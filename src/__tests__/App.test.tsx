import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('navigates to each tab via the sidebar and renders the correct content', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Expenses
    await user.click(screen.getByRole('button', { name: 'Spese' }))
    expect(await screen.findByText('Gestione Spese')).toBeInTheDocument()

    // Incomes
    await user.click(screen.getByRole('button', { name: 'Entrate' }))
    expect(await screen.findByText('Gestione Entrate')).toBeInTheDocument()

    // Users
    await user.click(screen.getByRole('button', { name: 'Utenti' }))
    expect(await screen.findByText('Gestione Utenti - In sviluppo')).toBeInTheDocument()

    // Inventory
    await user.click(screen.getByRole('button', { name: 'Inventario' }))
    expect(await screen.findByText('Inventario - In sviluppo')).toBeInTheDocument()

    // Reports
    await user.click(screen.getByRole('button', { name: 'Report' }))
    expect(await screen.findByText('Report - In sviluppo')).toBeInTheDocument()

    // Profile
    await user.click(screen.getByRole('button', { name: 'Profilo' }))
    expect(await screen.findByText('Profilo - In sviluppo')).toBeInTheDocument()

    // Settings
    await user.click(screen.getByRole('button', { name: 'Impostazioni' }))
    expect(await screen.findByText('Impostazioni - In sviluppo')).toBeInTheDocument()
  })
})
