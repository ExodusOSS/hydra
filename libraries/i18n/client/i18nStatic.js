import I18N from './i18n.js'

const createI18NStatic = ({ currency, locale, locales }) => {
  const i18n = new I18N({ defaultCurrency: currency, defaultLanguage: locale, languages: locales })

  return { ...i18n, t: i18n.translate }
}

export default createI18NStatic
