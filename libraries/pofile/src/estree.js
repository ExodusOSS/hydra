const tokenizer = require('./tokenizer')

const loc = (filePath, tokens) => ({
  start: tokens[0].start,
  end: tokens.length > 1 ? tokens[tokens.length - 1].end : tokens[0].end,
  source: filePath,
})

const range = (tokens) => [
  tokens[0].range[0],
  tokens.length > 1 ? tokens[tokens.length - 1].range[1] : tokens[0].range[1],
]

const comment = (token, filePath) => ({
  type: 'Line',
  value: token.value,
  loc: loc(filePath, [token]),
  range: range([token]),
})

const propertyKey = (token, filePath) => ({
  type: 'Identifier',
  name: token.value,
  loc: loc(filePath, [token]),
  range: range([token]),
})

const propertyValue = (token, filePath) => ({
  type: 'Literal',
  value: token.value,
  loc: loc(filePath, [token]),
  range: range([token]),
})

const property = (tokens, filePath) => ({
  type: 'Property',
  key: propertyKey(tokens[0], filePath),
  value: propertyValue(tokens[1], filePath),
  kind: 'init',
  loc: loc(filePath, tokens),
})

const message = (tokens, filePath) => {
  const properties = []
  let current = 0

  while (current < tokens.length) {
    properties.push(property(tokens.slice(current, current + 2), filePath))

    current += 2
  }

  const object = {
    type: 'ObjectExpression',
    properties,
    loc: loc(filePath, tokens),
    range: range(tokens),
  }

  return {
    object,
    nodes: [...properties, object],
  }
}

const section = (tokens, filePath) => {
  const body = []
  const nodes = []
  const comments = []
  let current = 0

  while (current < tokens.length) {
    const token = tokens[current]

    switch (token.type) {
      case 'comment':
        const line = comment(token, filePath)
        body.push(line)
        comments.push(line)

        current++
        break

      case 'name':
        const { object, nodes } = message(tokens.slice(current), filePath)
        body.push(object)
        nodes.push(...nodes)

        current += tokens.length
        break

      default:
        throw new TypeError(`Invalid type ${token.type}`)
    }
  }

  const block = {
    type: 'BlockStatement',
    body,
    loc: loc(filePath, tokens),
    range: range(tokens),
  }
  nodes.push(block)

  return {
    block,
    nodes,
    comments,
  }
}

const getNextCommentIndex = (tokens, current) => {
  while (current < tokens.length) {
    if (tokens[current].type === 'comment') {
      return current
    }

    current++
  }

  return current
}

const visit = (tokens, filePath) => {
  const body = []
  const nodes = []
  const comments = []
  let current = 0
  let previous = current

  while (current < tokens.length) {
    const token = tokens[current]

    switch (token.type) {
      case 'name':
        current = getNextCommentIndex(tokens, current)
        const { block, nodes, comments } = section(tokens.slice(previous, current), filePath)
        body.push(block)
        nodes.push(...nodes)
        comments.push(...comments)

        previous = current
        break

      default:
        current++
    }
  }

  return { body, nodes, comments }
}

const estree = (input, filePath) => {
  const tokens = tokenizer(input)

  const { body, nodes, comments } = visit(tokens, filePath)

  return {
    type: 'Program',
    body,
    loc: loc(filePath, tokens),
    range: range(tokens),
    tokens: nodes,
    comments,
  }
}

module.exports = estree
