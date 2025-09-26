import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'

describe('Header', () => {
  it('renders and opens/closes user menu', () => {
    render(<Header />)
  // Click the last icon button (avatar)
  const buttons = screen.getAllByRole('button')
  fireEvent.click(buttons[buttons.length - 1])
    // Menu items appear
    expect(screen.getByText('Profilo')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Profilo'))
  })
})
