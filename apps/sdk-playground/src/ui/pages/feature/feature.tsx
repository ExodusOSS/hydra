import { useParams } from 'wouter'
import lodash from 'lodash'

import exodus from '@/ui/exodus'
import { API_SPEC, getFeature, METADATA } from '@/ui/constants/index.js'
import Text from '@/ui/components/text/index.js'
import Icon from '@/ui/components/icon/index.js'

import Methods from './components/methods/index.js'
import Menu from './components/menu/menu.js'

const { camelCase, capitalize } = lodash

function FeaturePage() {
  const { name } = useParams()

  const activeFeature = camelCase(name)
  const { version, description, homepage } = METADATA[getFeature(activeFeature)] || {}

  const featureApiSpec = API_SPEC[activeFeature]
  const methods = featureApiSpec?.value ? Object.entries(featureApiSpec.value) : []

  const handleSubmit = async ({ namespace, name, args }) => {
    return exodus[namespace][name](...args)
  }

  const title = name?.split('-').map(capitalize).join(' ') || ''

  return (
    <div className="min-w-0 flex-auto px-8 pb-8 lg:max-w-none">
      <div className="pb-4 pt-8">
        <div className="flex items-center gap-4">
          <Text as="h1" className="mb-1 text-4xl font-bold">
            {title}
          </Text>

          {version && (
            <Text as="span" size={14} className="text-slate-500">
              v{version}
            </Text>
          )}

          {homepage && (
            <a
              href={homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 transition-colors duration-200 hover:text-slate-400"
            >
              <Icon name="github" size={20} />
            </a>
          )}
        </div>
        {description && (
          <Text as="h2" className="text-slate-500">
            {description}
          </Text>
        )}
      </div>

      <div className="flex flex-row gap-10">
        <div className="flex-1">
          <Methods namespace={activeFeature} methods={methods} onSubmit={handleSubmit} />
        </div>

        <div className="sticky top-8 hidden min-w-64 self-start lg:block">
          <Menu items={methods.map((v) => v[0])} />
        </div>
      </div>
    </div>
  )
}

export default FeaturePage
