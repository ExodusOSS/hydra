import EventEmitter from 'eventemitter3'
import { computeId } from '@exodus/pofile'

import formatters from '../formatters/index.js'
import * as icu from '../icu/index.js'

const castString = (value) => (Array.isArray(value) ? value.join('') : value)

class I18N extends EventEmitter {
  constructor({ defaultCurrency, defaultLanguage, languages = {} }) {
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

  #compareComputedIds = (a, b) => computeId(a) === computeId(b)

  getTranslation = (id) => {
    const currentLocaleTranslations = this.languages[this.language]
    const defaultLanguageTranslations = this.languages[this.defaultLanguage]

    if (currentLocaleTranslations) {
      const currentLocaleTranslation = Object.entries(currentLocaleTranslations).find(([key]) =>
        this.#compareComputedIds(key, id)
      )?.[1]
      if (currentLocaleTranslation?.length) return currentLocaleTranslation
    }

    if (defaultLanguageTranslations) {
      const defaultLanguageTranslation = Object.entries(defaultLanguageTranslations).find(([key]) =>
        this.#compareComputedIds(key, id)
      )?.[1]
      if (defaultLanguageTranslation?.length) return defaultLanguageTranslation
    }

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

  translate = (id, { values, punctuations } = {}) => {
    const translation = this.getTranslation(id)

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
