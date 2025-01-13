import React from 'react'

const isTag = (token) => token[0] === '<' && token[token.length - 1] === '>'

const isSelfClosingTag = (token) => isTag(token) && token.match(/<([^<>]*?)\/>/u)

const isOpeningTag = (token) => isTag(token) && token[1] !== '/'

const isClosingTag = (token) => isTag(token) && token[1] === '/'

export const getTranslationTokens = (string) => {
  return string.match(/<[^<>]*?>|(?:(?!<[^<>]*>).)+/gsu)
}

const formatTranslation = (string, mappings) => {
  const tokens = getTranslationTokens(string)
  const root = { name: 'root', parent: null }

  let children = []
  let currentNode = root

  const childrenStack = [children]

  for (const token of tokens) {
    if (isSelfClosingTag(token)) {
      const name = token.match(/<([^<>]*?)\/>/u)[1]?.trim()
      const element = React.cloneElement(mappings[name], { key: name })
      children.push(element)

      continue
    }

    if (isOpeningTag(token)) {
      const name = token.match(/<([^<>]*?)>/u)[1]
      const node = { name, children: [], parent: currentNode }
      const nodeChildren = []

      childrenStack.push(nodeChildren)
      children = nodeChildren

      currentNode = node

      continue
    }

    if (isClosingTag(token)) {
      const name = currentNode.name
      const nodeChildren = childrenStack.pop()

      children = childrenStack[childrenStack.length - 1]
      currentNode = currentNode.parent

      // Mapping should always be present as it's passed automatically, but prepare for the worst
      if (!mappings[name]) continue

      const element = React.cloneElement(mappings[name], { key: name, children: nodeChildren })
      children.push(element)

      continue
    }

    children.push(token)
  }

  return childrenStack[0]
}

export default formatTranslation
