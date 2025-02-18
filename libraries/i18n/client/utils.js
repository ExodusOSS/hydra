import { computeId } from '@exodus/pofile'

export const castString = (value) => (Array.isArray(value) ? value.join('') : value)

const toMap = (obj, transform) => {
  const map = new Map()
  Object.entries(obj).forEach((entry) => {
    const [key, value] = transform(entry)
    if (!map.has(key)) {
      map.set(key, value)
    }
  })
  return map
}

const translationTransform = ([id, values]) => [computeId(id), values]

const languageTransform = ([language, translations]) => [
  language,
  toMap(translations, translationTransform),
]

export const transformLanguages = (languages) => toMap(languages, languageTransform)
