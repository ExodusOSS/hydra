import EventEmitter from 'eventemitter3'
import { computeId, createEntryId } from '@exodus/pofile'

import formatters from '../formatters/index.js'
import * as icu from '../icu/index.js'
import { castString } from './utils.js'

class I18N extends EventEmitter {
  constructor({ defaultCurrency, defaultLanguage, languages = Object.create(null) }) {
    super()

    this.language = defaultLanguage
    this.defaultLanguage = defaultLanguage
    this.currency = defaultCurrency
    this.languages = languages
  }

  load = (languages) => {
    this.languages = languages
  }

  setCurrency = (currency) => {
    this.currency = currency

    this.emit('change', { currency })
  }

  setLanguage = (language) => {
    this.language = language

    this.emit('change', { locale: language })
  }

  getTranslation = (id, context) => {
    const currentLocaleTranslations = this.languages[this.language]
    const defaultLanguageTranslations = this.languages[this.defaultLanguage]
    const translationId = computeId(createEntryId({ id, context }))

    const currentLocaleTranslation = currentLocaleTranslations?.[translationId]
    if (currentLocaleTranslation?.length > 0) return currentLocaleTranslation

    const defaultLanguageTranslation = defaultLanguageTranslations?.[translationId]
    if (defaultLanguageTranslation?.length > 0) return defaultLanguageTranslation

    return icu.parse(id)
  }

  #format = (value, format, subType) => {
    const formatter = formatters[this.language]?.[format] || castString
    return formatter(value, { subType, currency: this.currency })
  }

  #interpolate = (translation, values) => {
    const opts = { currency: this.currency }
    return icu.interpolate(translation, values, formatters[this.language], opts)
  }

  translate = (id, { context, values, punctuations } = {}) => {
    const translation = this.getTranslation(id, context)

    const value = this.#interpolate(translation, values)
    const leadingPunctuations = punctuations?.leading || ''
    const trailingPunctuations = punctuations?.trailing || ''

    return `${leadingPunctuations}${value}${trailingPunctuations}`
  }

  number = (value) => this.#format(value, 'number')

  date = (value) => this.#format(value, 'date')

  time = (value) => this.#format(value, 'time')

  datetime = (value) => this.#format(value, 'datetime')

  amount = (value) => this.#format(value, 'amount')

  currency = (value) => this.#format(value, 'number', 'currency')
}

export default I18N
