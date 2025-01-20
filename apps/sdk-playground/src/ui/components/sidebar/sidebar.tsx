import { useParams } from 'wouter'
import Section, { type Item } from './section.js'
import lodash from 'lodash'

const { camelCase } = lodash

interface SidebarProps {
  sections: { title: string; items: Item[] }[]
}

const Sidebar = ({ sections }: SidebarProps) => {
  const { name } = useParams()
  const activeFeature = name ? camelCase(name) : undefined

  return (
    <div className="hidden lg:relative lg:block lg:flex-none">
      <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 " />

      <div className="sticky top-[68px] -ml-0.5 h-[calc(100vh-4.75rem)] w-64 overflow-y-auto overflow-x-hidden py-8 pl-0.5 pr-8 xl:w-72 xl:pr-16">
        <nav className="text-base lg:text-sm">
          <ul role="list" className="space-y-9">
            {sections.map((section) => (
              <Section
                key={section.title}
                title={section.title}
                items={section.items}
                active={activeFeature}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
