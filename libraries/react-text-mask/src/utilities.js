import { placeholderChar as defaultPlaceholderChar } from './constants.js'

const emptyArray = []

export function convertMaskToPlaceholder(
  mask = emptyArray,
  placeholderChar = defaultPlaceholderChar
) {
  if (!isArray(mask)) {
    throw new Error('Text-mask:convertMaskToPlaceholder; The mask property must be an array.')
  }

  if (mask.includes(placeholderChar)) {
    throw new Error(
      'Placeholder character must not be used as part of the mask. Please specify a character ' +
        'that is not present in your mask as your placeholder character.\n\n' +
        `The placeholder character that was received is: ${JSON.stringify(placeholderChar)}\n\n` +
        `The mask that was received is: ${JSON.stringify(mask)}`
    )
  }

  return mask
    .map((char) => {
      return char instanceof RegExp ? placeholderChar : char
    })
    .join('')
}

export function isArray(value) {
  return (Array.isArray && Array.isArray(value)) || Array.isArray(value)
}

export function isString(value) {
  return typeof value === 'string' || value instanceof String
}

export function isNumber(value) {
  return typeof value === 'number' && value.length === undefined && !isNaN(value)
}

export function isNil(value) {
  return value === undefined || value === null
}

const strCaretTrap = '[]'
export function processCaretTraps(mask) {
  const indexes = []

  let indexOfCaretTrap
  while (((indexOfCaretTrap = mask.indexOf(strCaretTrap)), indexOfCaretTrap !== -1)) {
    indexes.push(indexOfCaretTrap)

    mask.splice(indexOfCaretTrap, 1)
  }

  return { maskWithoutCaretTraps: mask, indexes }
}
