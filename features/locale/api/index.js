const localeApi = ({ currencyAtom, languageFusionAtom, languageAtom }) => ({
  locale: {
    setLanguage: async (value) => {
      await languageFusionAtom.set(value)
      await languageAtom.set(value) // ensure storage atom is set before app restarts
    },
    setCurrency: (value) => currencyAtom.set(value),
  },
})

const localeApiDefinition = {
  id: 'localeApi',
  type: 'api',
  factory: localeApi,
  dependencies: ['currencyAtom', 'languageFusionAtom', 'languageAtom'],
}

export default localeApiDefinition
