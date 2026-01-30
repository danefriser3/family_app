import { render } from '@testing-library/react'
import MuiIconStub from '../mui-icon-stub'

describe('MuiIconStub', () => {
  it('renders with default testid', () => {
    const { container } = render(<MuiIconStub />)
    expect(container.querySelector('[data-testid="mui-icon-stub"]')).toBeInTheDocument()
  })

  it('renders with custom testid', () => {
    const { container } = render(<MuiIconStub data-testid="custom-icon" />)
    expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument()
  })
})