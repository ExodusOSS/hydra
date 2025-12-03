const processToken = (token) => {
  if (token.type === 'text') return token.value

  if (token.type === 'arg') {
    const values = [`${token.name}`, token.format, token.subType].filter(Boolean)

    return `{${values.join(', ')}}`
  }

  if (token.type === 'tag') {
    if (token.side === 'opening') return `<${token.name}>`
    if (token.side === 'closing') return `</${token.name}>`
    if (token.side === 'both') return `<${token.name} />`
  }

  throw new Error(`Invalid token type ${token.type}`)
}

const stringify = (tokens) => {
  return tokens.reduce((acc, token) => acc + processToken(token), '').trim()
}

module.exports = stringify
