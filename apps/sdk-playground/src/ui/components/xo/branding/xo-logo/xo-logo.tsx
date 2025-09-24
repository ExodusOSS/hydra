import type { LogoProps } from '../types'
import XoLogomarkMonoSvg from '../../images/xo-logomark-mono.svg?svgr'
import XoLogomarkSvg from '../../images/xo-logomark.svg?svgr'

/**
 * XO logomark component that supports both colored and grayscale variants.
 * Automatically switches between colored and monochrome versions based on the grayscale prop.
 * @example
 * // Colored version
 * <XoLogomark size={32} />
 * @example
 * // Grayscale version
 * <XoLogomark size={32} grayscale />
 */
export const XoLogomark = ({
  className,
  alt = 'XO',
  color = 'currentColor',
  grayscale = false,
  size = 40,
}: LogoProps & {
  grayscale?: boolean
}) => {
  const Component = grayscale ? XoLogomarkMonoSvg : XoLogomarkSvg

  return <Component className={className} fill={color} title={alt} height={size} width={size} />
}
