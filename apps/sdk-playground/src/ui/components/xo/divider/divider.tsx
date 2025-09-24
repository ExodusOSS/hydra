import { cn } from '../utils/index.js'
import type { DividerProps } from './types'

// Inline style for custom gradient color.
const inlineStyle = ({ direction, gradientColor }: DividerProps) => {
  if (gradientColor) {
    return {
      background:
        direction === 'horizontal'
          ? `linear-gradient(to right, transparent, ${gradientColor}, transparent)`
          : `linear-gradient(to bottom, transparent, ${gradientColor}, transparent)`,
    }
  }

  return {}
}

/**
 * A versatile divider component that supports horizontal and vertical orientations.
 * Can be customized with gradient colors for visual enhancement.
 * @example
 * // Vertical divider (default)
 * <Divider />
 * @example
 * // Horizontal divider with gradient
 * <Divider direction="horizontal" gradientColor="rgba(255,255,255,0.1)" />
 */
export function Divider({ className, direction = 'vertical', gradientColor }: DividerProps) {
  return (
    <span
      className={cn(
        'block bg-black/8 dark:bg-white/8',
        direction === 'horizontal' && 'h-px w-full min-w-8',
        direction === 'vertical' && 'h-full min-h-8 w-px',
        className
      )}
      style={inlineStyle({ direction, gradientColor })}
      role="separator"
    />
  )
}
