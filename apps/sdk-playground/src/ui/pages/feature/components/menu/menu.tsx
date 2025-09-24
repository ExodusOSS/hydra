import lodash from 'lodash'

import Text from '@/ui/components/text'

const { kebabCase } = lodash

interface MenuProps {
  items: string[]
}

function Menu({ items }: MenuProps) {
  return (
    <div>
      <Text size={14} className="mb-2 text-slate-300">
        On this page
      </Text>

      <ul>
        {/* Methods section header */}
        <li className="mb-1">
          <Text size={14} className="font-medium text-foreground">
            Methods
          </Text>
        </li>

        {/* Individual methods - indented */}
        {items.map((item) => (
          <li key={item} className="mb-1 ml-4">
            <a href={`#${kebabCase(item)}`}>
              <Text
                size={14}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </Text>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Menu
