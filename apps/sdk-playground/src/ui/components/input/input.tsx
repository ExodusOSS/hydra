import { cn } from '@/ui/utils/classnames'
import type { ChangeEventHandler } from 'react'

type Props = {
  type: string
  value: any
  className?: string
  placeholder?: string
  required?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const Input = ({ type, value, placeholder, required, className, onChange }: Props) => {
  return (
    <input
      className={cn(className, 'rounded border px-2')}
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
    />
  )
}

export default Input
