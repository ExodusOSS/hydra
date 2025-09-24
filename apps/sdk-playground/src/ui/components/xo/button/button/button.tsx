import { cn } from '@/ui/utils/classnames'

import { getSizeClassName, getVariantClassName } from '../styles'
import type { ButtonProps } from '../types'
import { IconWrapper } from './parts/icon-wrapper'
import { InnerText } from './parts/inner-text'
import { ButtonWrapper } from './parts/wrapper'

/**
 * A versatile button component that supports multiple variants, sizes, and icon configurations.
 * The button can be used as a regular button or as a link when an href prop is provided.
 *
 * ### Features
 * - Multiple variants: **primary**, **secondary**, **tertiary**, **gradient**, and **primary-gradient**
 * - Four sizes: **sm** `32px`, **md** `40px`, **lg** `48px`, **xl** `56px`
 * - Icon support (left and right)
 * - Link functionality
 * - Dark mode support
 * - Disabled state
 * - Custom styling through className prop
 *
 */
export const Button = ({
  children,
  href,
  className,
  disabled,
  onClick,
  role,
  target,
  size = 'md',
  textClassName = '',
  variant = 'gradient',
  IconLeft,
  IconRight,
  ...props
}: ButtonProps) => {
  const activeSize = getSizeClassName({ size })
  const activeVariant = getVariantClassName({ variant, disabled })

  const hasChildComponent = typeof children !== 'string' && typeof children !== 'number'

  return (
    <ButtonWrapper
      className={cn(activeSize.wrapper, activeVariant.wrapper, className)}
      disabled={disabled}
      href={href}
      onClick={onClick}
      role={role}
      target={target}
      {...props}
    >
      {IconLeft && (
        <IconWrapper className={IconLeft.wrapperClassName}>
          <IconLeft.Component />
        </IconWrapper>
      )}
      {hasChildComponent ? (
        children
      ) : (
        <InnerText size={size} className={textClassName}>
          {children}
        </InnerText>
      )}
      {IconRight && (
        <IconWrapper className={IconRight.wrapperClassName}>
          <IconRight.Component />
        </IconWrapper>
      )}
    </ButtonWrapper>
  )
}
