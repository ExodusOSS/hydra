import type { ChangeEventHandler } from 'react'

import { cn } from '@/ui/utils/classnames'

type CheckboxProps = {
  value: any
  className?: string
  required?: boolean
  onChange?: ChangeEventHandler<HTMLInputElement>
}

function Checkbox({ value, className, onChange }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={value}
      className={cn(
        'size-6 rounded border-none bg-deep-300 text-deep-300 outline-none focus:ring-0',
        className
      )}
      onChange={onChange}
    />
  )
}

export default Checkbox
