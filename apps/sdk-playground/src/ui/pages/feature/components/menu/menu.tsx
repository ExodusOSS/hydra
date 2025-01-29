import { Link } from 'wouter'

import Text from '@/ui/components/text'

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
            <Link to={item}>
              <Text size={14} className=" text-slate-500">
                {item}
              </Text>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Menu
