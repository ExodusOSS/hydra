import { fireEvent, render, screen } from '@testing-library/react'

import Button from '@/ui/components/button/button'

describe('Button Component', () => {
  test('renders with text content', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  test('renders with default gradient variant', () => {
    render(<Button>Default Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  test('renders with custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  test('renders as link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
  })

  test('supports different sizes', () => {
    const { rerender } = render(<Button size="sm">Small Button</Button>)
    expect(screen.getByText('Small Button')).toBeInTheDocument()

    rerender(<Button size="lg">Large Button</Button>)
    expect(screen.getByText('Large Button')).toBeInTheDocument()
  })

  test('renders with target attribute for links', () => {
    render(
      <Button href="/test" target="_blank">
        External Link
      </Button>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
  })

  test('supports custom role', () => {
    render(<Button role="menuitem">Menu Item</Button>)

    const button = screen.getByRole('menuitem')
    expect(button).toBeInTheDocument()
  })

  test('renders children components instead of text', () => {
    render(
      <Button>
        <span data-testid="custom-child">Custom Child</span>
      </Button>
    )

    expect(screen.getByTestId('custom-child')).toBeInTheDocument()
  })
})
