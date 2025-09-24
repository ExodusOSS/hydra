import { cn } from '@/ui/utils/classnames'

import { getTextSizeClassName } from '../../styles'
import type { ButtonInnerTextProps } from '../../types'

export function InnerText({ children, className, size = 'md' }: ButtonInnerTextProps) {
  const activeTextSize = getTextSizeClassName(size)

  return (
    <span
      className={cn(
        activeTextSize,
        'relative z-10 inline-block flex-1 truncate whitespace-nowrap text-nowrap font-medium tracking-[-0.005em]',
        className
      )}
    >
      {children}
    </span>
  )
}
