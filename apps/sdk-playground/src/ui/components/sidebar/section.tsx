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
      <h2 className="font-display font-medium text-slate-900 ">{title}</h2>
      <ul
        role="list"
        className="mt-2 space-y-2 border-l-2 border-slate-100 lg:mt-4 lg:border-slate-200"
      >
        {items.map(({ name, href, incomplete }) => (
          <li key={name} className="relative">
            <Link href={href}>
              <div
                className={cn(
                  'block w-full cursor-pointer pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full',
                  {
                    'font-semibold text-primary before:bg-primary': active === name,
                    'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block':
                      active !== name,
                    'text-slate-200': incomplete,
                  }
                )}
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
