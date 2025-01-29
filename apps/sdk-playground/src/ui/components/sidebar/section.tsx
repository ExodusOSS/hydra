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
      <h2 className="font-display text-sm font-light text-slate-300">{title}</h2>

      <ul role="list" className="ml-1 mt-4 space-y-2 border-l-2 border-deep-100">
        {items.map(({ name, href, incomplete }) => (
          <li key={name} className="relative">
            <Link href={href}>
              <div
                className={cn('block w-full cursor-pointer pl-4 text-sm', {
                  'font-thin': active === name,
                  'text-slate-500 hover:text-slate-400': active !== name,
                  'text-slate-700': incomplete,
                })}
              >
                {name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  )
}

export default Section
