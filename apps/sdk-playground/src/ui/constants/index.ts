import exodus from '@/ui/exodus'

import apiSpec from '../../../api.json'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import METADATA from '../../../metadata.json'

const { kebabCase } = lodash

export const API_SPEC = apiSpec.value

const featureByNamespace = {
  __proto__: null,
  errors: 'error-tracking',
  assetPreferences: 'assets-feature',
  transactionSigner: 'tx-signer',
  assets: 'assets-feature',
  features: 'feature-flags',
  rates: 'rates-monitor',
}

const EXCLUDE = new Set(['subscribe', 'unsubscribe', 'debug'])

export function getFeature(namespace: string) {
  return featureByNamespace[namespace] ?? kebabCase(namespace)
}

export const NAMESPACES = [...new Set(Object.keys(exodus))]
  .filter((namespace) => {
    // Filter out excluded namespaces
    if (EXCLUDE.has(namespace)) {
      return false
    }

    // Filter out namespaces that have no methods
    const namespaceApi = API_SPEC[namespace]
    if (!namespaceApi?.value || Object.keys(namespaceApi.value).length === 0) {
      // No methods available, don't show in sidebar
      return false
    }

    // Filter out namespaces that are not public or have no metadata
    const feature = getFeature(namespace)
    const featureMetadata = METADATA[feature]
    return !(featureMetadata && !featureMetadata.public)
  })
  .sort((a, b) => a.localeCompare(b))

// also used in integration tests
export const DEFAULT_MNEMONIC =
  'menu memory fury language physical wonder dog valid smart edge decrease worth'

export { default as METADATA } from '../../../metadata.json'

export const DEFAULT_PASSPHRASE = 'abracadabra'
