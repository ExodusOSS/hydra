import Sidebar from '@/ui/components/sidebar'
import Text from '@/ui/components/text'
import exodus from '@/ui/exodus'

import Methods from './components/methods/index.js'
import Selectors from './components/selectors/index.js'
import DevTools from './components/dev-tools/index.js'

import selectors from '@/ui/flux/selectors'
import { API_SPEC, NAMESPACES } from '@/ui/constants/index.js'
import { useParams } from 'wouter'
import lodash from 'lodash'

const { camelCase, kebabCase, isEmpty } = lodash

const SIDEBAR = [
  {
    title: 'API Namespaces',
    items: NAMESPACES.map((namespace: string) => ({
      name: namespace,
      href: `/features/${kebabCase(namespace)}`,
      incomplete: isEmpty(API_SPEC[namespace]?.value) && isEmpty(selectors[namespace]),
    })),
  },
]

function FeaturePage() {
  const { name } = useParams()

  const activeFeature = camelCase(name)
  const featureApiSpec = API_SPEC[activeFeature]
  const methods = featureApiSpec?.value ? Object.entries(featureApiSpec.value) : []
  const featureSelectors = Object.entries(selectors[activeFeature] || {})

  const handleSubmit = async ({ namespace, name, args }) => {
    return exodus[namespace][name](...args)
  }

  return (
    <>
      <Sidebar sections={SIDEBAR} />

      <div className="min-w-0 max-w-2xl flex-auto px-4 py-8 lg:max-w-none lg:pl-8 lg:pr-0 xl:px-16">
        <Text as="h1" size={24} className="mb-6">
          {activeFeature}
        </Text>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Methods namespace={activeFeature} methods={methods} onSubmit={handleSubmit} />
          </div>

          <div>
            <Selectors selectors={featureSelectors} />
          </div>

          {methods.length === 0 && featureSelectors.length === 0 && (
            <div>Help! Submit a Pull Request with types for this feature's API</div>
          )}
        </div>
      </div>
      <DevTools />
    </>
  )
}

export default FeaturePage
