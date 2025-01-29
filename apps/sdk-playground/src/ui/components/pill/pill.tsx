import { cn } from '@/ui/utils/classnames'
import type React from 'react'

type Props<E extends React.ElementType> = React.PropsWithChildren<
  {
    className?: string
    active?: boolean
    as?: E
  } & React.ComponentProps<E>
>

const Pill = <E extends React.ElementType>({
  as: Component = 'div',
  className,
  children,
  active,
  ...rest
}: Props<E>) => (
  <Component
    {...rest}
    className={cn(
      className,
      'rounded-lg px-4 py-2 text-sm font-medium',
      active ? 'bg-deep-300' : 'bg-deep-400 text-slate-500'
    )}
  >
    {children}
  </Component>
)

export default Pill
