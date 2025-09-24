import type { LogoProps } from '../types'
import PoweredByExodusMarkSvg from '../../images/powered-by-exodus-mark.svg?svgr'

/**
 * "Powered by Exodus" mark component.
 * Displays the Exodus branding text with proper sizing and styling.
 * @example
 * <PoweredByExodusMark />
 */
export const PoweredByExodusMark = ({
  className,
  alt = 'Powered by Exodus',
  color = 'currentColor',
  size = 162,
}: LogoProps) => {
  return (
    <PoweredByExodusMarkSvg
      className={className}
      fill={color}
      title={alt}
      height={Math.round(size * 0.117)}
      width={size}
    />
  )
}
