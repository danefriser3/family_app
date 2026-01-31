import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

// Mock MUI Icons before any other imports to prevent EMFILE
vi.mock('@mui/icons-material', () => {
  const Stub = (props: any) => React.createElement('svg', { 'data-testid': 'mui-icon-stub', ...props })
  return new Proxy({}, { get: () => Stub })
})

import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  it('renders menu items', () => {
    render(
      <BrowserRouter>
        <Sidebar activeTab="dashboard" />
      </BrowserRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Spese')).toBeInTheDocument();
    expect(screen.getByText('Entrate')).toBeInTheDocument();
  });
});