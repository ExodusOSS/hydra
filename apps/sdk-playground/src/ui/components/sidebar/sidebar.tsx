import { useParams } from 'wouter'
import Section, { type Item } from './section.js'
import lodash from 'lodash'

import ExodusLogo from '../exodus-logo/index.js'
import Searchbar from '../searchbar/searchbar.js'
import Scrollable from './scrollable.js'

const { camelCase } = lodash

interface SidebarProps {
  sections: { title: string; items: Item[] }[]
  onSearchClick: () => void
}

const Sidebar = ({ sections, onSearchClick }: SidebarProps) => {
  const { name } = useParams()

  const activeFeature = name ? camelCase(name) : undefined

  return (
    <nav className="flex h-screen min-h-full w-64 flex-col gap-7 overflow-hidden border-r border-r-deep-100 bg-deep-400 p-5 pb-0 xl:w-72">
      <ExodusLogo size={35} withShadow />

      <Searchbar onSearchClick={onSearchClick} />

      <Scrollable>
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
      </Scrollable>
    </nav>
  )
}

export default Sidebar
