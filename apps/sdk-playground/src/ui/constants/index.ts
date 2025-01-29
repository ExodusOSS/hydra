import exodus from '@/ui/exodus'

import apiSpec from '../../../api.json'
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
    const feature = getFeature(namespace)
    return (!METADATA[feature] || METADATA[feature].public) && !EXCLUDE.has(namespace)
  })
  .sort((a, b) => a.localeCompare(b))

// also used in integration tests
export const DEFAULT_MNEMONIC =
  'menu memory fury language physical wonder dog valid smart edge decrease worth'

export { default as METADATA } from '../../../metadata.json'

export const DEFAULT_PASSPHRASE = 'abracadabra'
