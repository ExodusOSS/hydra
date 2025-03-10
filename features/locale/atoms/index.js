import createCurrencyAtom from './currency.js'
import createLanguageAtom from './language.js'

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
