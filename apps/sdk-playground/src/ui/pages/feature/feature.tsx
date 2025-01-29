import { useLocation, useParams } from 'wouter'
import lodash from 'lodash'

import exodus from '@/ui/exodus'
import { API_SPEC, getFeature, METADATA } from '@/ui/constants/index.js'
import Text from '@/ui/components/text/index.js'
import Icon from '@/ui/components/icon/index.js'
import Button from '@/ui/components/button/index.js'
import Tabs from '@/ui/components/tabs/index.js'
import useQueryParams from '@/ui/hooks/use-query-params.js'

import Methods from './components/methods/index.js'
import Menu from './components/menu/menu.js'

const { camelCase, capitalize } = lodash

function FeaturePage() {
  const { name } = useParams()
  const { tab = 'methods' } = useQueryParams()
  const [location, navigate] = useLocation()

  const activeFeature = camelCase(name)
  const { version, description, homepage } = METADATA[getFeature(activeFeature)] || {}

  const featureApiSpec = API_SPEC[activeFeature]
  const methods = featureApiSpec?.value ? Object.entries(featureApiSpec.value) : []

  const handleSubmit = async ({ namespace, name, args }) => {
    return exodus[namespace][name](...args)
  }

  const handleSourceClick = () => {
    window.open(homepage, '_blank')
  }

  const handleTabChange = (tab) => {
    navigate(`${location}?tab=${tab}`, { replace: true })
  }

  const tabs = [{ id: 'methods', label: 'Methods' }]

  const title = name?.split('-').map(capitalize).join(' ') || ''

  return (
    <div className="min-w-0 max-w-2xl flex-auto px-8 pb-8 lg:max-w-none">
      <div className="sticky top-0 z-10 bg-deep-600 pt-8">
        <div className="flex items-center gap-4">
          <Text as="h1" size={24} className="mb-1">
            {title}
          </Text>

          {version && (
            <Text as="span" size={14} className="text-slate-500">
              v{version}
            </Text>
          )}

          {homepage && (
            <Button variant="transparent" onClick={handleSourceClick}>
              <Icon name="github" size={20} className="text-slate-600" />
            </Button>
          )}
        </div>

        {description && (
          <Text size={16} className="text-slate-500">
            {description}
          </Text>
        )}

        <Tabs className="mt-8" options={tabs} active={tab} onChange={handleTabChange} />
      </div>

      <div className="flex flex-row gap-10 pt-8">
        <div className="flex-1">
          {tab === 'methods' && (
            <Methods namespace={activeFeature} methods={methods} onSubmit={handleSubmit} />
          )}
        </div>

        <div className="sticky top-[205px] min-w-64 self-start">
          <Menu items={(tab === 'methods' ? methods : []).map((v) => v[0])} />
        </div>
      </div>
    </div>
  )
}

export default FeaturePage
