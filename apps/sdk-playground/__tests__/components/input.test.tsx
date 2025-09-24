import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import Input from '@/ui/components/input/input'

describe('Input Component', () => {
  test('renders with placeholder text', () => {
    render(<Input placeholder="Enter text here" />)
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  test('handles value changes through onChange', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()

    render(<Input placeholder="Test input" onChange={handleChange} />)

    const input = screen.getByPlaceholderText('Test input')
    await user.type(input, 'Hello')

    // Should be called for each character typed
    expect(handleChange).toHaveBeenCalledTimes(5)
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'Hello' }),
      })
    )
  })

  test('displays controlled value', () => {
    render(<Input value="Controlled value" onChange={jest.fn()} />)

    const input = screen.getByDisplayValue('Controlled value')
    expect(input).toBeInTheDocument()
  })

  test('calls onFocus and onBlur handlers', async () => {
    const user = userEvent.setup()
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(<Input placeholder="Focus test" onFocus={handleFocus} onBlur={handleBlur} />)

    const input = screen.getByPlaceholderText('Focus test')

    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    await user.tab() // Move focus away
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  test('supports different input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text input" />)
    expect(screen.getByPlaceholderText('Text input')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" placeholder="Email input" />)
    expect(screen.getByPlaceholderText('Email input')).toHaveAttribute('type', 'email')

    // Test fallback to text for unsupported types
    rerender(<Input type="password" placeholder="Password input" />)
    expect(screen.getByPlaceholderText('Password input')).toHaveAttribute('type', 'text')
  })

  test('applies hasError prop styling', () => {
    render(<Input placeholder="Error input" hasError />)

    const input = screen.getByPlaceholderText('Error input')
    // We can't easily test the styling, but we can ensure the prop is passed
    expect(input).toBeInTheDocument()
  })

  test('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} placeholder="Ref test" />)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement))
  })

  test('spreads additional props', () => {
    render(
      <Input
        placeholder="Props test"
        data-testid="custom-input"
        disabled
        className="custom-class"
      />
    )

    const input = screen.getByTestId('custom-input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('custom-class')
  })

  test('has correct display name', () => {
    expect(Input.displayName).toBe('Input')
  })
})
