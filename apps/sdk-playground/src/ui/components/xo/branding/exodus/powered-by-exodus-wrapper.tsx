import { cn } from '../../utils/index.js'
import type { ReactNode } from 'react'
import { PoweredByExodusMark } from './powered-by-exodus-mark'
import { Divider } from '../../divider/index.js'
import { Link } from '../../link/index.js'
import type { ResponsiveLogoProps } from '../types'

type PoweredByExodusWrapperProps = ResponsiveLogoProps & {
  children: ReactNode
}

/**
 * Wrapper component that displays a logo with the "Powered by Exodus" branding.
 * Handles responsive behavior, showing/hiding the trailing mark based on screen size.
 * @example
 * <PoweredByExodusWrapper>
 *   <XoLogomark grayscale />
 * </PoweredByExodusWrapper>
 */
export function PoweredByExodusWrapper({
  children,
  className,
  forceTrailingMark = false,
  hideTrailingMark = false,
  href = '/',
  noTrailingMark = false,
  target,
  rel,
  ...props
}: PoweredByExodusWrapperProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(
        'flex max-h-7 max-w-20 items-center justify-start gap-x-3 outline-none ring-transparent transition-all focus:outline-none focus:ring-transparent md:max-h-9 md:max-w-max',
        className
      )}
      {...props}
    >
      {children}
      <Divider
        className={cn(
          'lg:opacity-100 lg:transition-opacity',
          forceTrailingMark ? 'block' : 'hidden lg:block',
          hideTrailingMark && 'lg:opacity-0',
          noTrailingMark && 'lg:hidden'
        )}
      />
      <PoweredByExodusMark
        className={cn(
          'lg:translate-x-0 lg:opacity-100 lg:transition-all',
          forceTrailingMark ? 'block' : 'hidden lg:block',
          hideTrailingMark && 'lg:-translate-x-6 lg:opacity-0',
          noTrailingMark && 'lg:hidden'
        )}
      />
    </Link>
  )
}
