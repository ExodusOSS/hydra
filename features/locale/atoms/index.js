import createCurrencyAtom from './currency'
import createLanguageAtom from './language'

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
