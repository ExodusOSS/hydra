import { cn } from '@/ui/utils/classnames'

import type { ButtonIconWrapperProps } from '../../types'

export function IconWrapper({ children, className }: ButtonIconWrapperProps) {
  return (
    <span
      className={cn('z-1 relative inline-flex shrink-0 items-center justify-center', className)}
    >
      {children}
    </span>
  )
}
