/* eslint-disable import/no-extraneous-dependencies */
import ts from 'typescript'
import fs from 'fs'
import path from 'path'
import { TextRange } from '@microsoft/tsdoc'
import { getDocCommentJson, getJSDocCommentRanges, tsdocParser } from './docs.js'

const fileName = process.argv[2]
const program = ts.createProgram([fileName], {})
const sourceFile = program.getSourceFile(fileName)

const checker = program.getTypeChecker()

const isBooleanType = (type) => {
  return (type.flags & ts.TypeFlags.Boolean) !== 0
}

/**
 * @param {ts.Type} type
 * @param {Set<ts.Type>} ancestors
 */
function convertObjectLike(type, ancestors) {
  const isPartial = type.aliasSymbol?.name === 'Partial'
  const properties = type.getProperties()

  const value = properties.reduce((acc, property) => {
    const propertyName = property.getName()
    const declaration = property.declarations[0]
    const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration)
    const resolvedType = resolveType(propertyType, ancestors)
    const optional = isPartial || !!(property.flags & ts.SymbolFlags.Optional)
    const fullText = declaration.getSourceFile().getFullText()
    const [comment] = getJSDocCommentRanges(declaration, fullText)

    let doc
    if (comment) {
      const { docComment } = tsdocParser.parseRange(
        TextRange.fromStringRange(fullText, comment.pos, comment.end)
      )
      doc = getDocCommentJson(docComment)
    }

    return resolvedType ? { ...acc, [propertyName]: { ...resolvedType, optional, doc } } : acc
  }, {})

  return { type: 'object', value }
}

/**
 * @param {ts.Type} type
 * @param {Set<ts.Type>} ancestors Tracks the ancestors of a type to prevent infinite recursion for classes with self-referencing properties
 */
function resolveType(type, ancestors = new Set()) {
  if (ancestors.has(type)) {
    return
  }

  ancestors = new Set([...ancestors, type])
  const typeSymbol = type.getSymbol()

  if (type.isUnion()) {
    const isBoolean = isBooleanType(type)
    if (isBoolean) {
      return {
        type: 'boolean',
      }
    }

    return {
      type: 'union',
      value: type.types.map((t) => resolveType(t, ancestors)),
    }
  }

  if (type.isLiteral()) {
    return {
      type: 'literal',
      const: type.value,
    }
  }

  if (typeSymbol && typeSymbol.getName() === 'Array') {
    return {
      type: 'array',
      value: resolveType(type.resolvedTypeArguments[0], ancestors),
    }
  }

  if (type.getCallSignatures().length > 0) {
    const signature = type.getCallSignatures()[0]

    const args = signature.parameters.map((param) => {
      const paramType = checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration)
      return { [param.getName()]: resolveType(paramType, ancestors) }
    })

    return {
      type: 'function',
      args: args.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      returnType: checker.typeToString(checker.getReturnTypeOfSignature(signature)),
    }
  }

  if (type.isClassOrInterface()) {
    return { originalType: typeSymbol.escapedName, ...convertObjectLike(type, ancestors) }
  }

  if (typeSymbol || type.isIntersection()) {
    return convertObjectLike(type, ancestors)
  }

  return { type: checker.typeToString(type) }
}

const outputPath = path.resolve('./api.json')

sourceFile.forEachChild((node) => {
  if (ts.isExportAssignment(node)) {
    const type = checker.getTypeAtLocation(node.expression)
    const json = resolveType(type)

    fs.writeFileSync(outputPath, JSON.stringify(json, null, 2))
  }
})
