import { Input as XoInput } from '@/ui/components/xo/input'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string
  placeholder?: string
  hasError?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name = '',
      placeholder = '',
      type = 'text',
      hasError,
      onChange,
      onFocus,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    // Convert HTML input onChange to XO Input onChange
    const handleChange = (newValue: string) => {
      if (onChange) {
        // Create a synthetic event-like object for backward compatibility
        const event = {
          target: { value: newValue },
          currentTarget: { value: newValue },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }

    // Convert type to XO Input supported types
    const xoType = type === 'email' ? 'email' : 'text'

    return (
      <XoInput
        ref={ref}
        name={name}
        placeholder={placeholder}
        type={xoType}
        hasError={hasError}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
