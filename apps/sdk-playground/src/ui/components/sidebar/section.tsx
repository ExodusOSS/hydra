import { cn } from '@/ui/utils/classnames'
import { Link } from 'wouter'

export type Item = { name: string; href: string; incomplete: boolean }

interface SectionProps {
  title: string
  items: Item[]
  active?: string
}

const Section = ({ title, items, active }: SectionProps) => {
  return (
    <li>
      <h2 className="font-display pl-4 text-sm font-bold text-foreground">{title}</h2>

      <ul role="list" className="mt-4 space-y-1">
        {items.map(({ name, href, incomplete }) => {
          const isActive =
            active === name ||
            active === name.toLowerCase() ||
            active === name.replace(/\s+/gu, '').toLowerCase() ||
            active ===
              name
                .replace(/\s+/gu, '')
                .toLowerCase()
                .replace(/[^\da-z]/gu, '')

          return (
            <li key={name} className="relative">
              <Link href={href}>
                <div
                  className={cn(
                    'block w-full cursor-pointer rounded-md py-1.5 text-sm font-medium transition-all',
                    'pl-8 pr-2', // 2rem left padding - more than section title
                    {
                      'bg-secondary font-bold text-accent': isActive,
                      'text-muted-foreground hover:bg-muted': !isActive,
                      'text-muted-foreground/50': incomplete,
                    }
                  )}
                >
                  {name}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

export default Section
