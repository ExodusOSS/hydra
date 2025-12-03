const castString = (value) => (Array.isArray(value) ? value.join('') : value)

const interpolate = (tokens, values, formatters, opts = Object.create(null)) => {
  const { currency } = opts

  try {
    return tokens.reduce((message, token) => {
      if (token.type === 'text') return message + token.value

      if (token.type === 'arg') {
        const { name, position, format, subType } = token
        const formatter =
          typeof format === 'string' &&
          formatters &&
          Object.prototype.hasOwnProperty.call(formatters, format)
            ? formatters[format]
            : castString

        const { value } =
          values[name] ?? Object.values(values).find((value) => value.positions.includes(position))

        const formattedValue = format ? formatter(value, { subType, currency }) : value

        return message + formattedValue
      }

      // JSX is interpolated in react layer
      if (token.type === 'tag') return message

      throw new Error(`Invalid token type ${token.type}`)
    }, '')
  } catch (err) {
    console.error(err)

    return ''
  }
}

module.exports = interpolate
