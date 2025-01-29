import { cn } from '@/ui/utils/classnames'
import type { ChangeEventHandler } from 'react'

type InputProps = {
  type: string
  value: any
  className?: string
  placeholder?: string
  required?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const Input = ({ type, value, placeholder, required, className, onChange }: InputProps) => {
  return (
    <input
      className={cn(
        'text-thin rounded border-none bg-deep-300 px-2 text-sm text-slate-300 focus:outline-none focus:ring-0',
        className
      )}
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
    />
  )
}

export default Input
