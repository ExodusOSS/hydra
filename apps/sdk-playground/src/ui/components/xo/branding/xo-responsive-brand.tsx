import { XoLogomark } from './xo-logo/index.js'
import { PoweredByExodusWrapper } from './exodus/index.js'
import type { ResponsiveLogoProps } from './types'

/**
 * Complete XO responsive brand component.
 * Combines the XO logomark with the "Powered by Exodus" branding in a responsive layout.
 * @example
 * <XoResponsiveBrand href="https://example.com" />
 */
export function XoResponsiveBrand(props: ResponsiveLogoProps) {
  return (
    <PoweredByExodusWrapper {...props}>
      <XoLogomark className="max-h-7 md:max-h-full" grayscale />
    </PoweredByExodusWrapper>
  )
}
