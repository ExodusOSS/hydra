import { cn } from '../../xo/utils/index.js'

export type LegalSectionProps = {
  disclaimerSection?: DisclaimerProps | null
  legalLinksSection?: LegalLinksProps | null
  mobileBreakpoint?: 'md' | 'lg'
}

export type DisclaimerProps = {
  text?: string[]
}

type Link = {
  href: string
  label: string
}

export type LegalLinksProps = {
  links?: Link[]
}

const defaultDisclaimerText = [
  'Exodus is a software platform ONLY and does not conduct any independent diligence on or substantive review of any blockchain asset, digital currency, cryptocurrency or associated funds. You are fully and solely responsible for evaluating your investments, for determining whether you will swap blockchain assets based on your own, and for all your decisions as to whether to swap blockchain assets with the Exodus in app swap feature. In many cases, blockchain assets you swap on the basis of your research may not increase in value, and may decrease in value. Similarly, blockchain assets you swap on the basis of your research may increase in value after your swap.',
  'Past performance is not indicative of future results. Any investment in blockchain assets involves the risk of loss of part or all of your investment. The value of the blockchain assets you swap is subject to market and other investment risks.',
  'Exodus users are responsible for storing their own recovery phrase. If the recovery phrase is lost, the user might not be able to retrieve their private keys.',
]

const defaultLegalLinks = [
  { href: 'https://www.exodus.com/legal/privacy/', label: 'Privacy Policy' },
  { href: 'https://www.exodus.com/legal/terms/', label: 'Terms of Service' },
  { href: 'https://www.exodus.com/legal/trademarks/', label: 'Trademarks' },
]

export function LegalSection({
  disclaimerSection,
  legalLinksSection,
  mobileBreakpoint = 'md',
}: LegalSectionProps) {
  const disclaimerText = disclaimerSection?.text || defaultDisclaimerText
  const legalLinks = legalLinksSection?.links || defaultLegalLinks

  return (
    <section
      className={cn(
        'container mx-auto flex flex-col gap-y-6',
        mobileBreakpoint === 'md' && 'md:px-4',
        mobileBreakpoint === 'lg' && 'lg:px-4'
      )}
    >
      {disclaimerSection !== null && (
        <div className="max-w-6xl space-y-4 text-xs text-white/32">
          {disclaimerText.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {legalLinksSection !== null && (
        <div className="flex items-center space-x-4 text-xs">
          {legalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/50 underline transition-colors hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
