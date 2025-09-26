import { render, screen } from '@testing-library/react'
import { StatCard } from '../StatCard'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(
      <StatCard title="Credito totale" value="€ 1.234,56" icon={<span>€</span>} color="success" />
    )
    expect(screen.getByText('Credito totale')).toBeInTheDocument()
    expect(screen.getByText('€ 1.234,56')).toBeInTheDocument()
  })

  it('shows positive change with TrendingUp', () => {
    render(
      <StatCard title="Totale Entrate" value="€ 500,00" change={10} icon={<span>+</span>} />
    )
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('vs mese scorso')).toBeInTheDocument()
  })
})
