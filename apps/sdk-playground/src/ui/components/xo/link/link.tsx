import { cn } from '../utils/index.js'
import type { LinkProps } from './types'

/**
 * Simple link component with consistent styling.
 * Provides a foundation for navigation links with proper accessibility.
 * @example
 * <Link href="/dashboard">Go to Dashboard</Link>
 * @example
 * <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
 *   External Link
 * </Link>
 */
export function Link({ href = '/', className, children, target, rel, ...props }: LinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn('inline-flex items-center text-inherit no-underline', className)}
      {...props}
    >
      {children}
    </a>
  )
}
