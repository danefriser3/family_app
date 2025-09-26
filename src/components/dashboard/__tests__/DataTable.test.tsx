import { render, screen } from '@testing-library/react'
import { DataTable } from '../DataTable'

describe('DataTable', () => {
  const columns = [
    { id: 'name', label: 'Nome' },
    { id: 'email', label: 'Email' },
  ] as const;

  const rows = [
    { id: 1, name: 'Mario', email: 'mario@example.com' },
    { id: 2, name: 'Giulia', email: 'giulia@example.com' },
  ] as unknown as Record<string, unknown>[];

  it('renders title, headers and rows', () => {
  render(<DataTable title="Utenti" data={rows} columns={columns as any} />);
  // Title is rendered as Typography h6 inside CardHeader
  expect(screen.getByRole('heading', { level: 6, name: 'Utenti' })).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Mario')).toBeInTheDocument();
    expect(screen.getByText('giulia@example.com')).toBeInTheDocument();
  });
});
