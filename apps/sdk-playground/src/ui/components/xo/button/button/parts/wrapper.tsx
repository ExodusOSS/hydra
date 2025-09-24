import { cn } from '@/ui/utils/classnames'
import { forwardRef } from 'react'

import { Link } from '../../../link/link'
import type { ButtonWrapperProps } from '../../types'

export const ButtonWrapper = forwardRef<HTMLButtonElement, ButtonWrapperProps>(
  function ButtonWrapper(props, ref) {
    const { children, href, className, disabled, onClick, role, target, ...rest } = props

    const commonProps = {
      className: cn('flex h-max items-center justify-center', className),
      disabled,
      ...(disabled ? {} : { onClick }),
      ...rest,
    }

    if (href) {
      return (
        <Link
          href={href}
          role={role || 'link'}
          target={target}
          {...(target === '_blank' ? { rel: 'noreferrer' } : {})}
          {...commonProps}
        >
          {children}
        </Link>
      )
    }

    return (
      <button role={role || 'button'} type="button" {...commonProps} ref={ref}>
        {children}
      </button>
    )
  }
)
