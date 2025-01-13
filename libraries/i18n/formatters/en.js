const _number = (value) => new Intl.NumberFormat('en-US').format(value)

const currency = (value, { currency } = {}) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)

export const amount = (value) => {
  // Cannot use Intl.NumberFormat since custom currencies are not supported (e.g. custom tokens).
  const [amount, ticker] = value?.split(' ') || []
  return `${_number(amount)} ${ticker}`
}

export const percent = (value) => {
  const option = {
    style: 'percent',
    maximumFractionDigits: 2,
  }
  return new Intl.NumberFormat('en-US', option).format(value)
}

const formatterBySubType = {
  currency,
  percent,
}

export const number = (value, { subType, ...opts }) => {
  const formatter = formatterBySubType[subType] || _number

  return formatter(value, { ...opts })
}

export const date = (value) => new Intl.DateTimeFormat('en-US').format(value)

export const time = (value) =>
  new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
  }).format(value)

export const datetime = (value) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value)
