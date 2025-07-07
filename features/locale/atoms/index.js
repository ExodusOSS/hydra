import createCurrencyAtom from './currency.js'
import createLanguageAtom from './language.js'
import createLanguageFusionAtom from './language-fusion.js'

export const currencyAtomDefinition = {
  id: 'currencyAtom',
  type: 'atom',
  factory: createCurrencyAtom,
  dependencies: ['fusion', 'config'],
  public: true,
}

export const languageAtomDefinition = {
  id: 'languageAtom',
  type: 'atom',
  factory: createLanguageAtom,
  dependencies: ['storage', 'config'],
  public: true,
}

export const languageFusionAtomDefinition = {
  id: 'languageFusionAtom',
  type: 'atom',
  factory: createLanguageFusionAtom,
  dependencies: ['fusion'],
  public: true,
}
