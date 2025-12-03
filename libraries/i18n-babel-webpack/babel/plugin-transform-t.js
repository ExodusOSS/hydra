const { stringify } = require('../icu/index.js')
const tokenize = require('./tokenizer.js')
const extractPunctuations = require('./punctuation.js')

const moduleName = '@exodus/i18n'

const HOOK_NAME = 'useI18n'

const DECORATOR_NAME = 'withI18n'

const TRANSFORM_FNS = new Set(['t', 'T'])

const isIdNode = (node) => node.name.name === 'id'

const getIdValue = (node) => {
  const attributes = node.openingElement?.attributes || []
  return attributes.find((element) => isIdNode(element))?.value.value
}

const getValues = (tokens, type) => {
  return tokens.reduce((acc, token) => {
    if (token.type === type) {
      if (token.name in Object.prototype) {
        return acc
      }

      if (token.position === undefined) {
        acc[token.name] = token.value
        return acc
      }

      if (acc[token.name]) {
        acc[token.name].positions.push(token.position)
        return acc
      }

      acc[token.name] = {
        value: token.value,
        positions: [token.position],
      }
    }

    return acc
  }, Object.create(null))
}

const createValuesObjectExpression = (t, obj) =>
  t.objectExpression(
    Object.entries(obj).map(([key, data]) =>
      t.objectProperty(
        t.stringLiteral(key),
        t.objectExpression([
          t.objectProperty(t.stringLiteral('value'), data.value),
          t.objectProperty(
            t.stringLiteral('positions'),
            t.arrayExpression(data.positions.map((position) => t.numericLiteral(position)))
          ),
        ])
      )
    )
  )

// Handles T component transormation
// <T>{children}<T/> gets transformed to <T id={icu(children)} />
const transformJSXElement = (t, path, opts) => {
  // Preserves explicit id if passed
  const originalId = getIdValue(path.node)

  // Transform T children elements to their ICU representation
  const tokens = tokenize(t, path.node, opts)
  const icuString = originalId || stringify(tokens)
  const values = getValues(tokens, 'arg')
  const components = getValues(tokens, 'tag')
  const { message, ...punctuations } = extractPunctuations(icuString)

  // Keep the original T props except id
  const attributes = path.node.openingElement.attributes.filter((v) => !isIdNode(v))

  // Add the id prop
  attributes.push(
    t.jsxAttribute(t.jsxIdentifier('id'), t.jsxExpressionContainer(t.stringLiteral(message)))
  )

  // Create new AST node and replace original one

  // Parameters for variable substitution
  const valuesObject = createValuesObjectExpression(t, values)

  if (valuesObject.properties.length > 0) {
    attributes.push(
      t.jsxAttribute(t.jsxIdentifier('values'), t.jsxExpressionContainer(valuesObject))
    )
  }

  if (punctuations.leading || punctuations.trailing) {
    const punctuationValues = Object.entries(punctuations).map(
      ([key, value]) => value && t.objectProperty(t.stringLiteral(key), t.stringLiteral(value))
    )

    attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('punctuations'),
        t.jsxExpressionContainer(t.objectExpression(punctuationValues.filter(Boolean)))
      )
    )
  }

  // Parameters for components substitution
  const componentsObject = Object.keys(components).map((key) =>
    t.objectProperty(t.stringLiteral(key), components[key])
  )

  if (componentsObject.length > 0) {
    attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('components'),
        t.jsxExpressionContainer(t.objectExpression(componentsObject))
      )
    )
  }

  const newOpeningElement = t.jsxOpeningElement(
    t.jsxIdentifier(path.node.openingElement.name.name),
    attributes,
    true
  )

  const newJsxElement = t.jsxElement(newOpeningElement, null, [], true)

  newJsxElement.loc = path.node.loc

  path.replaceWith(newJsxElement)
}

const transformCallExpression = (t, path, opts) => {
  const [idNode, optionsNode] = path.node.arguments

  if (!t.isStringLiteral(idNode) && !t.isTemplateLiteral(idNode)) return

  // Transform t first argument to its ICU representation
  const tokens = tokenize(t, idNode, opts)
  const icuString = stringify(tokens)
  const values = getValues(tokens, 'arg')
  const { message, ...punctuations } = extractPunctuations(icuString)

  const callArguments = [t.stringLiteral(message)]

  const valuesObject = createValuesObjectExpression(t, values)

  const argValues = []

  if (valuesObject.properties.length > 0) {
    argValues.push(t.objectProperty(t.stringLiteral('values'), valuesObject))
  }

  if (punctuations.leading || punctuations.trailing) {
    const punctuationValues = Object.entries(punctuations).map(
      ([key, value]) => value && t.objectProperty(t.stringLiteral(key), t.stringLiteral(value))
    )

    argValues.push(
      t.objectProperty(
        t.stringLiteral('punctuations'),
        t.objectExpression(punctuationValues.filter(Boolean))
      )
    )
  }

  if (optionsNode && t.isObjectExpression(optionsNode)) {
    const contextProperty = optionsNode.properties.find(
      (p) => t.isObjectProperty(p) && p.key.name === 'context'
    )
    if (contextProperty) {
      const contextObject = t.objectProperty(
        t.stringLiteral('context'),
        t.stringLiteral(contextProperty.value.value)
      )
      argValues.push(contextObject)
    }
  }

  if (argValues.length > 0) {
    callArguments.push(t.objectExpression(argValues))
  }

  const filterContextNode = (arg) =>
    !t.isObjectExpression(arg) || arg.properties.find((arg) => arg.key.name !== 'context')

  // Create new AST node replacing original first argument with ICU
  const newArguments = [...callArguments, ...path.node.arguments.slice(1).filter(filterContextNode)]

  const newCallExpression = t.callExpression(path.node.callee, newArguments)

  path.replaceWith(newCallExpression)
  path.skip()
}

// Babel plugin visitor. We intersect and modify two types of nodes:
//  - t call expressions. t('input') gets transformed to t(icu(input))
//  - T JSX elements. <T>{children}<T/> gets transformed to  <T id={icu(children)} />
const TransformTPlugin = ({ types: t }) => {
  function importVisitor(path, state) {
    const fileName = state.file.opts.filename

    const modules = [moduleName, ...(state.opts.additionalModules || [])]
    if (!modules.includes(path.node.source.value)) return

    const specifiers = path.node.specifiers
    const names = Object.fromEntries(
      specifiers.map((s) => [s.local.name, s.imported?.name || s.local.name])
    )
    const prevNames = this.fileImportMap.get(fileName)

    this.fileImportMap.set(fileName, { ...prevNames, ...names })

    const decorators = new Set([DECORATOR_NAME, ...(state.opts.additionalDecorators || [])])

    if (specifiers.some((specifier) => decorators.has(specifier.imported?.name))) {
      this.decoratorPresent = true
    }
  }

  function programCallExpressionVisitor(path, state) {
    const fileName = state.file.opts.filename
    const callName = path.node.callee.name
    const fileImports = this.fileImportMap.get(fileName)
    const hookMap = fileImports?.[callName]

    if (hookMap !== HOOK_NAME) return

    const properties = path.parent?.id?.properties || []
    const usedFns = Object.fromEntries(properties.map((p) => [p.value.name, p.key.name]))

    this.fileImportMap.set(fileName, { ...fileImports, ...usedFns })
  }

  function programVisitor(programPath, state) {
    programPath.traverse(
      {
        ImportDeclaration: importVisitor,
        CallExpression: programCallExpressionVisitor,
      },
      state
    )
  }

  function jsxElementVisitor(path, state) {
    const fileName = state.file.opts.filename
    const fileImports = this.fileImportMap.get(fileName)
    const elementName = path.node.openingElement.name.name
    const elementMap = fileImports?.[elementName]

    if (!TRANSFORM_FNS.has(elementMap)) return
    if (path.node.children.length === 0) return

    transformJSXElement(t, path, state.opts)
  }

  function callExpressionVisitor(path, state) {
    const fileName = state.file.opts.filename
    const fileImports = this.fileImportMap.get(fileName)
    const callName = path.node.callee.name
    const callMap = fileImports?.[callName]

    if (!TRANSFORM_FNS.has(callMap) && !(this.decoratorPresent && TRANSFORM_FNS.has(callName))) {
      return
    }

    transformCallExpression(t, path, state.opts)
  }

  function pre() {
    // Keep track of i18n file import and it's aliases
    this.fileImportMap = new Map()
    this.decoratorPresent = false
  }

  function post() {
    // Clear file mapping to start over
    this.fileImportMap.clear()
    this.decoratorPresent = false
  }

  const visitor = {
    Program: programVisitor,
    JSXElement: jsxElementVisitor,
    CallExpression: callExpressionVisitor,
  }

  return { pre, visitor, post }
}

module.exports = TransformTPlugin
