import createLocaleAnalyticsPlugin from './analytics'
import createLocalePlugin from './lifecycle'

export const localeLifecyclePluginDefinition = {
  id: 'localeLifecyclePlugin',
  type: 'plugin',
  factory: createLocalePlugin,
  dependencies: ['languageAtom', 'port', 'currencyAtom'],
  public: true,
}

export const localeAnalyticsPluginDefinition = {
  id: 'localeAnalyticsPlugin',
  type: 'plugin',
  factory: createLocaleAnalyticsPlugin,
  dependencies: ['analytics', 'languageAtom'],
  public: true,
}
