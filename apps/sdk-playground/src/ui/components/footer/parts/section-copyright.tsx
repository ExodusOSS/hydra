import { cn } from '../../xo/utils/index.js'
import { ExodusMark } from './exodus-mark.js'
import { Divider, Link } from '../../xo/index.js'
import { SocialLinks } from './social-links.js'

export type CopyrightSectionProps = {
  copyrightSection?: CopyrightProps | null
  socialLinkSection?: SocialLinksProps | null
  className?: string
  mobileBreakpoint?: 'md' | 'lg'
}

export type CopyrightProps = {
  text?: string[]
}

export type SocialLinksProps = {
  mobileBreakpoint?: 'md' | 'lg'
}

const defaultText = [
  `Copyright © ${new Date().getFullYear()} Exodus Movement, Inc.`,
  'Exodus was co-founded by Daniel Castagnoli and JP Richardson.',
]

export function CopyrightSection({
  copyrightSection,
  socialLinkSection,
  className,
  mobileBreakpoint = 'md',
}: CopyrightSectionProps) {
  const text = copyrightSection?.text || defaultText

  return (
    <section
      className={cn(
        'container-xl flex flex-col gap-y-8 py-8',
        mobileBreakpoint === 'md' &&
          'md:flex-row md:items-center md:justify-between md:gap-x-8 md:gap-y-0 md:px-4 md:py-10',
        mobileBreakpoint === 'lg' &&
          'lg:flex-row lg:items-center lg:justify-between lg:gap-x-8 lg:gap-y-0 lg:px-4 lg:py-10',
        className
      )}
      aria-label="Footer information"
    >
      <div
        className={cn(
          'flex flex-col gap-y-2.5',
          mobileBreakpoint === 'md' && 'md:flex-row md:items-center md:gap-x-4 md:gap-y-0',
          mobileBreakpoint === 'lg' && 'lg:flex-row lg:items-center lg:gap-x-4 lg:gap-y-0'
        )}
      >
        <Link
          href="https://www.exodus.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'block h-8 w-auto max-w-[197px]',
            mobileBreakpoint === 'md' && 'md:h-10',
            mobileBreakpoint === 'lg' && 'lg:h-10'
          )}
        >
          <ExodusMark className="h-full w-auto object-left" />
        </Link>

        <Divider
          className={cn(
            'hidden',
            mobileBreakpoint === 'md' && 'md:block',
            mobileBreakpoint === 'lg' && 'lg:block'
          )}
        />

        <div
          className={cn(
            'text-sm text-white/50',
            mobileBreakpoint === 'md' && 'max-md:opacity-32',
            mobileBreakpoint === 'lg' && 'max-lg:opacity-32'
          )}
        >
          {text.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </div>
      </div>

      {socialLinkSection !== null && <SocialLinks mobileBreakpoint={mobileBreakpoint} />}
    </section>
  )
}
