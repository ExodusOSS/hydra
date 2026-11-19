import createCurrencyAtom from './currency.js'
import createCurrencyFusionAtom from './currency-fusion.js'
import createLanguageAtom from './language.js'
import createLanguageFusionAtom from './language-fusion.js'

export const currencyAtomDefinition = {
  id: 'currencyAtom',
  type: 'atom',
  factory: createCurrencyAtom,
  dependencies: ['storage', 'config'],
  public: true,
}

export const currencyFusionAtomDefinition = {
  id: 'currencyFusionAtom',
  type: 'atom',
  factory: createCurrencyFusionAtom,
  dependencies: ['fusion'],
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
