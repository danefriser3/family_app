import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  it('renders menu items and calls onTabChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Sidebar activeTab="dashboard" onTabChange={handleChange} />);

    // Basic items visible
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Spese')).toBeInTheDocument();
    expect(screen.getByText('Entrate')).toBeInTheDocument();

    // Click on Entrate
    fireEvent.click(screen.getByText('Entrate'));
    expect(handleChange).toHaveBeenCalledWith('incomes');
  });
});
