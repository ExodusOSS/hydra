import { Link, useParams } from 'wouter'
import Icon from '@/ui/components/icon'

import Exchange from './pages/exchange/index.js'

const UIComponents = {
  exchange: Exchange,
}

function UIPage() {
  const { name } = useParams<{ name: string }>()

  const UIComponent = UIComponents[name]

  return (
    <div className="py-6">
      <Link href={`/features/${name}`}>
        <div className="flex gap-2">
          <Icon name="arrow-left" />
          Back
        </div>
      </Link>

      <div className="py-6">{UIComponent ? <UIComponent /> : <div>Component not found</div>}</div>
    </div>
  )
}

export default UIPage
