const createLocaleAnalyticsPlugin = ({ analytics, languageAtom }) => {
  let unsubscribe

  const onStart = () => {
    analytics.requireDefaultEventProperties(['selectedLanguage'])

    unsubscribe = languageAtom.observe((language) => {
      analytics.setDefaultEventProperties({ selectedLanguage: language })
    })
  }

  const onStop = () => {
    unsubscribe?.()
  }

  return { onStart, onStop }
}

export default createLocaleAnalyticsPlugin
