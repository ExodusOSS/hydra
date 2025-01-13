import localeApiDefinition from './api'
import { localeLifecyclePluginDefinition, localeAnalyticsPluginDefinition } from './plugin'
import { currencyAtomDefinition, languageAtomDefinition } from './atoms'

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
