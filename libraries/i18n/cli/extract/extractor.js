import { existsSync, statSync, readdirSync } from 'fs'
import { relative, join } from 'path'
import {
  isIdentifier,
  isCallExpression,
  isSequenceExpression,
  isMemberExpression,
  isJSXElement,
  isJSXIdentifier,
  isStringLiteral,
  isTemplateLiteral,
} from '@babel/types'
import { transformFileSync } from '@babel/core'
import traverseCJS from '@babel/traverse'
import lodash from 'lodash'

import transformPlugin from '@exodus/i18n-babel-webpack/babel/plugin-transform-t.js'

const traverse = traverseCJS.default || traverseCJS

const FILE_REGEX = new RegExp('\\.c?[jt]sx?$', 'iu')
const { zip } = lodash

const isTIndentifier = (node) => {
  return isIdentifier(node, { name: 't' })
}

const isTCallExpression = (node) => {
  if (!isCallExpression(node)) return false

  const callee = node.callee

  const isValidCallExpression = isTIndentifier(callee)

  const isValidSequenceExpression =
    isSequenceExpression(callee) &&
    isMemberExpression(callee.expressions[1]) &&
    isTIndentifier(callee.expressions[1].property)

  return isValidCallExpression || isValidSequenceExpression
}

const isTJSXElement = (node) => {
  return isJSXElement(node) && isJSXIdentifier(node.openingElement.name, { name: 'T' })
}

const BABEL_PLUGINS = ['proposal-decorators', 'proposal-export-default-from']

const getNodeId = (node) => {
  if (isStringLiteral(node)) return node.value

  if (isTemplateLiteral(node)) {
    const quasis = node.quasis.map((text) => {
      return text.value.raw === '' ? null : text.value.raw
    })

    const expressions = node.expressions.map((exp) => `{${exp.name}}`)

    return zip(quasis, expressions).flat().filter(Boolean).join('')
  }

  throw new Error(`cant compute id of node type ${node.type}`)
}

const getNodeLine = (node) => {
  if (isSequenceExpression(node.callee)) {
    const expressions = node.callee.expressions
    const lastExpression = expressions[expressions.length - 1]
    return lastExpression.loc?.start?.line
  }

  return node.callee.loc?.start?.line
}

const extractFile = (fileName, options) => {
  const result = []

  if (options.ignoreRegex?.test(fileName)) return result

  if (!FILE_REGEX.test(fileName)) return result

  const origin = relative(options.rootDir, fileName)

  const jsxElementVisitor = ({ node }) => {
    if (!isTJSXElement(node)) return

    const idNode = node.openingElement.attributes.find((a) => a.name.name === 'id')
    const id = idNode.value.expression.value
    const line = node.loc?.start?.line
    const colonLine = line ? `:${line}` : ''
    const reference = `${origin}${colonLine}`

    result.push({ id, reference })
  }

  const callExpressionVisitor = ({ node }) => {
    if (!isTCallExpression(node)) return

    const arg = node.arguments[0]

    if (!isStringLiteral(arg) && !isTemplateLiteral(arg)) return

    const id = getNodeId(arg)
    const line = getNodeLine(node)
    const colonLine = line ? `:${line}` : ''
    const reference = `${origin}${colonLine}`

    result.push({ id, reference })
  }

  const extractPlugin = () => ({ visitor: { JSXElement: jsxElementVisitor } })

  // we don't directly specify the plugins by name because they can be either under /node_modules or /src/node_modules
  // or maybe even somewhere entirely different, this saves us having to locate where they are.
  const plugins = (options.babelrc.plugins ?? []).filter((plugin) => {
    const name = typeof plugin === 'string' ? plugin : plugin[0]
    return BABEL_PLUGINS.some((it) => name.endsWith(it))
  })

  const { ast } = transformFileSync(fileName, {
    ast: true,
    babelrc: false,
    configFile: false,
    envName: 'development',
    presets: options.babelrc.presets,
    plugins: [
      ...plugins,
      [
        transformPlugin,
        {
          additionalModules: options.additionalModules,
          additionalDecorators: options.additionalDecorators,
        },
      ],
      extractPlugin,
    ],
  })

  traverse(ast, { CallExpression: callExpressionVisitor })

  return result
}

const extractFiles = (fileNames, options) => {
  const entries = []

  for (const fileName of fileNames) {
    if (!existsSync(fileName)) continue

    let subEntries

    if (statSync(fileName).isDirectory()) {
      const subdirs = readdirSync(fileName).map((f) => join(fileName, f))

      subEntries = extractFiles(subdirs, options)
    } else {
      subEntries = extractFile(fileName, options)
    }

    entries.push(...subEntries)
  }

  return entries
}

export default extractFiles
