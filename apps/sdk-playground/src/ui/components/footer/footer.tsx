import { cn } from '../xo/utils/index.js'
import type { ReactElement } from 'react'
import { CopyrightSection } from './parts/section-copyright.js'
import type { CopyrightSectionProps } from './parts/section-copyright.js'
import { LegalSection } from './parts/section-legal.js'
import type { LegalSectionProps } from './parts/section-legal.js'
import { NavigationSection } from './parts/section-navigation.js'
import type { NavigationSectionProps } from './parts/section-navigation.js'

type FooterMobileBreakpoint = 'md' | 'lg'

export interface FooterProps {
  className?: string
  showTopBorder?: boolean
  contactSection?: NavigationSectionProps['contactSection']
  copyrightSection?: CopyrightSectionProps['copyrightSection']
  disclaimerSection?: LegalSectionProps['disclaimerSection']
  legalLinksSection?: LegalSectionProps['legalLinksSection']
  socialLinkSection?: CopyrightSectionProps['socialLinkSection']
  NavMenu?: ReactElement
  navigationMobileBreakpoint?: FooterMobileBreakpoint
}

function Footer({
  className,
  showTopBorder,
  contactSection,
  copyrightSection,
  disclaimerSection,
  legalLinksSection,
  socialLinkSection,
  NavMenu,
  navigationMobileBreakpoint = 'md',
}: FooterProps) {
  return (
    <footer
      className={cn(
        'z-[1] flex flex-col px-72 pb-16 md:pb-40',
        !!showTopBorder && 'border-t border-white/8',
        className
      )}
      role="contentinfo"
      aria-label="Site footer"
    >
      {(contactSection !== null || !!NavMenu) && (
        <NavigationSection contactSection={contactSection}>{NavMenu}</NavigationSection>
      )}
      {(copyrightSection !== null || socialLinkSection !== null) && (
        <CopyrightSection
          copyrightSection={copyrightSection}
          socialLinkSection={socialLinkSection}
          mobileBreakpoint={navigationMobileBreakpoint}
        />
      )}
      {(disclaimerSection !== null || legalLinksSection !== null) && (
        <LegalSection
          disclaimerSection={disclaimerSection}
          legalLinksSection={legalLinksSection}
          mobileBreakpoint={navigationMobileBreakpoint}
        />
      )}
    </footer>
  )
}

export default Footer
