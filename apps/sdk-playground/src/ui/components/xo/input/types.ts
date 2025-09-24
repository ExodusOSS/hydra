export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name?: string
  placeholder?: string
  type?: 'email' | 'text' | 'number'
  hasError?: boolean
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}
