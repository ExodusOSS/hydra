const lodash = require('lodash')

const { zip } = lodash

const tokenizeText = (value) => ({ type: 'text', value: value.replace(/\n/gu, '\\n') })

const tokenizeNumber = (value) => ({ type: 'text', value: `${value}` })

const tokenizeStringLiteral = (t, node) => {
  return [tokenizeText(node.value)]
}

const tokenizeNumericLiteral = (t, node) => {
  return [tokenizeNumber(node.value)]
}

const tokenizeExpression = (t, node) => ({
  type: 'arg',
  value: node,
  name: expressionToArgument(t, node),
})

const tokenizeTemplateLiteral = (t, node) => {
  const quasis = node.quasis.map((text) => {
    return text.value.raw === '' ? null : tokenizeText(text.value.raw)
  })

  const expressions = node.expressions.map((exp) => tokenizeExpression(t, exp))

  return zip(quasis, expressions).flat().filter(Boolean)
}

const expressionToArgument = (t, node) => {
  if (t.isIdentifier(node)) {
    return node.name
  }

  if (t.isMemberExpression(node)) {
    const object = expressionToArgument(t, node.object)
    const property = expressionToArgument(t, node.property)

    return object + '.' + property
  }

  return ''
}

const tokenizeChildren = (t, node) => {
  if (t.isJSXSpreadChild(node)) return []

  if (t.isJSXText(node)) {
    const value = node.value.replace(/^\n\s+|\n\s+$/gu, '').replace(/\n\s+/gu, ' ')

    return [tokenizeText(value)]
  }

  if (t.isJSXExpressionContainer(node)) {
    const exp = node.expression

    if (t.isStringLiteral(exp)) {
      return tokenizeStringLiteral(t, exp)
    }

    if (t.isTemplateLiteral(exp)) {
      return tokenizeTemplateLiteral(t, exp)
    }

    if (t.isNumericLiteral(exp)) {
      return tokenizeNumericLiteral(t, exp)
    }

    return [tokenizeExpression(t, exp)]
  }

  if (t.isJSXElement(node)) {
    return tokenizeJSXElement(t, node)
  }

  return [tokenizeText(node.value)]
}

// Transforms a JSX ast into tokens, so we can compute the ICU key from it
const tokenizeJSXElement = (t, node) => {
  const subtokens = node.children.flatMap((child) => tokenizeChildren(t, child))

  const newNode = { ...t.cloneNode(node), children: [] }

  if (!node.closingElement) return [{ type: 'tag', side: 'both', value: newNode }]

  const openingToken = { type: 'tag', side: 'opening', value: newNode }
  const closingToken = { type: 'tag', side: 'closing', value: newNode }

  return [openingToken, ...subtokens, closingToken]
}

// some arguments might not have a name, so we fill it with positional indices
// we use positional indices too if explicitely disabled from config
const addArgPositionalNames = (tokens, opts) => {
  const { preserveVariableNames = true } = opts

  let argPositionalCounter = 0

  return tokens.map((token) => {
    if (token.type !== 'arg') return token

    const position = argPositionalCounter++
    let name = position
    if (preserveVariableNames && token.name) name = token.name

    return { ...token, name, position }
  })
}

// Nested JSX elements are expressed as `<0>content</0>` in message id
const tagPositionalNames = (tokens) => {
  let tagPositionalCounter = 0
  const tagCounterStack = []

  return tokens.map((token) => {
    if (token.type !== 'tag') return token

    let name

    if (token.side === 'opening') {
      name = tagPositionalCounter++
      tagCounterStack.push(name)
    }

    if (token.side === 'closing') {
      name = tagCounterStack.pop()
    }

    if (token.side === 'both') {
      name = tagPositionalCounter++
    }

    return { ...token, name }
  })
}

const tokenize = (t, node, opts = Object.create(null)) => {
  let tokens

  if (t.isJSXElement(node)) {
    tokens = node.children.flatMap((child) => tokenizeChildren(t, child))
  }

  if (t.isStringLiteral(node)) {
    tokens = tokenizeStringLiteral(t, node)
  }

  if (t.isTemplateLiteral(node)) {
    tokens = tokenizeTemplateLiteral(t, node)
  }

  if (!tokens) throw new Error(`Invalid ${node.type} node to translate`)

  tokens = addArgPositionalNames(tokens, opts)
  tokens = tagPositionalNames(tokens)

  return tokens
}

module.exports = tokenize
