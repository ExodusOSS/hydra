const localeApi = ({ currencyAtom, currencyFusionAtom, languageFusionAtom, languageAtom }) => ({
  locale: {
    setLanguage: async (value) => {
      await languageFusionAtom.set(value)
      await languageAtom.set(value) // ensure storage atom is set before app restarts
    },
    setCurrency: async (value) => {
      await currencyFusionAtom.set(value)
      await currencyAtom.set(value) // ensure storage atom is set before app restarts
    },
  },
})

const localeApiDefinition = {
  id: 'localeApi',
  type: 'api',
  factory: localeApi,
  dependencies: ['currencyAtom', 'currencyFusionAtom', 'languageFusionAtom', 'languageAtom'],
}

export default localeApiDefinition
