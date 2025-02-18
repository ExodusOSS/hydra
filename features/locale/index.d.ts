import type localeApiDefinition from './api/index.js'

declare const locale: () => {
  id: 'locale'
  definitions: [{ definition: typeof localeApiDefinition }]
}

export default locale
