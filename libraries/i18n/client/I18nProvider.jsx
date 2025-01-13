import React, { useEffect, useMemo, useState } from 'react'

import I18nContext from './context.js'
import I18N from './i18n.js'

const I18nProvider = ({
  currency,
  locale,
  locales,
  setLocale,
  defaultCurrency,
  defaultLanguage,
  children,
}) => {
  const [currentLocale, setCurrentLocale] = useState(locale)
  const [currentCurrency, setCurrentCurrency] = useState(currency)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const i18n = useMemo(() => new I18N({ defaultCurrency, defaultLanguage }), [])

  useEffect(() => {
    const handler = ({ locale, currency }) => {
      if (locale) setCurrentLocale(locale)
      if (currency) setCurrentCurrency(currency)
    }

    i18n.addListener('change', handler)
    return () => i18n.removeListener('change', handler)
  }, [i18n])

  useEffect(() => {
    i18n.load(locales)
  }, [i18n, locales])

  useEffect(() => {
    i18n.setLanguage(locale)
  }, [i18n, locale])

  useEffect(() => {
    i18n.setCurrency(currency)
  }, [i18n, currency])

  const value = useMemo(
    () => ({
      i18n,
      t: i18n.translate,
      locale: currentLocale,
      setLocale,
      currency: currentCurrency,
      setCurrency: setCurrentCurrency,
    }),
    [i18n, currentLocale, setLocale, currentCurrency, setCurrentCurrency]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export default I18nProvider
