import localeApiDefinition from './api/index.js'
import { localeLifecyclePluginDefinition, localeAnalyticsPluginDefinition } from './plugin/index.js'
import {
  currencyAtomDefinition,
  languageAtomDefinition,
  languageFusionAtomDefinition,
} from './atoms/index.js'

const DEFAULT_LANGUAGE = 'en'
const DEFAULT_CURRENCY = 'USD'

const locale = (
  { defaultCurrency = DEFAULT_CURRENCY, defaultLanguage = DEFAULT_LANGUAGE } = Object.create(null)
) => {
  return {
    id: 'locale',
    definitions: [
      {
        definition: currencyAtomDefinition,
        config: { defaultValue: defaultCurrency },
      },
      {
        definition: languageAtomDefinition,
        config: { defaultValue: defaultLanguage },
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
        storage: { namespace: 'locale' },
      },
      {
        definition: languageFusionAtomDefinition,
      },
      { definition: localeLifecyclePluginDefinition },
      {
        if: { registered: ['analytics'] },
        definition: localeAnalyticsPluginDefinition,
      },
      { definition: localeApiDefinition },
    ],
  }
}

export default locale
