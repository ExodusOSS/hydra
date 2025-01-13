import localeApiDefinition from './api'

declare const locale: () => {
  id: 'locale'
  definitions: [{ definition: typeof localeApiDefinition }]
}

export default locale
