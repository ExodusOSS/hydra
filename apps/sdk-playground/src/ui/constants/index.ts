import exodus from '@/ui/exodus'
import selectors from '@/ui/flux/selectors'

import apiSpec from '../../../api.json'

export const API_SPEC = apiSpec.value

export const NAMESPACES = [...new Set([...Object.keys(exodus), ...Object.keys(selectors)])]
  .filter((item) => !['subscribe', 'unsubscribe'].includes(item))
  .sort((a, b) => a.localeCompare(b))
