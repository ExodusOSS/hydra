import { useParams } from 'wouter'
import Section, { type Item } from './section.js'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import Scrollable from './scrollable.js'

const { camelCase } = lodash

interface SidebarProps {
  sections: { title: string; items: Item[] }[]
}

const Sidebar = ({ sections }: SidebarProps) => {
  const { name } = useParams()

  const activeFeature = name ? camelCase(name) : undefined

  return (
    <nav className="flex h-[calc(100vh-64px)] min-h-full w-64 flex-col overflow-hidden bg-background p-5 xl:w-72">
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
