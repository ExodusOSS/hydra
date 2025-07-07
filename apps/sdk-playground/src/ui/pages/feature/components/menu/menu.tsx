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
        {items.map((item) => (
          <li key={item} className="mb-1 ml-2">
            <a href={`#${kebabCase(item)}`}>
              <Text size={14} className=" text-slate-500">
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
