import { cn } from '@/ui/utils/classnames'
import { forwardRef } from 'react'

import * as styles from './styles'
import type { InputProps } from './types'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name = '',
      placeholder = '',
      type = 'text',
      hasError,
      onChange,
      onFocus,
      onBlur,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <input
        autoComplete="off"
        className={cn(styles.inputClassNames, hasError && styles.inputErrorClassNames, className)}
        name={name}
        placeholder={placeholder}
        ref={ref}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
    )
  }
)
