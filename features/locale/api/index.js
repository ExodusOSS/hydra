const localeApi = ({ languageAtom, currencyAtom }) => ({
  locale: {
    setLanguage: (value) => languageAtom.set(value),
    setCurrency: (value) => currencyAtom.set(value),
  },
})

const localeApiDefinition = {
  id: 'localeApi',
  type: 'api',
  factory: localeApi,
  dependencies: ['languageAtom', 'currencyAtom'],
}

export default localeApiDefinition
