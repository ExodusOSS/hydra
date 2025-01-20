/* eslint-disable import/no-extraneous-dependencies */
import ts from 'typescript'
import {
  StringBuilder,
  TSDocEmitter,
  DocComment,
  TSDocConfiguration,
  TSDocParser,
  TSDocTagDefinition,
  TSDocTagSyntaxKind,
} from '@microsoft/tsdoc'

const tsdocConfiguration = new TSDocConfiguration()
tsdocConfiguration.addTagDefinition(
  new TSDocTagDefinition({
    tagName: '@sample',
    syntaxKind: TSDocTagSyntaxKind.BlockTag,
  })
)

export const tsdocParser = new TSDocParser(tsdocConfiguration)

/**
 * @param {ts.Node} node
 * @param {string} text
 * @returns {ts.CommentRange[]}
 */
export const getJSDocCommentRanges = (node, text) => {
  const commentRanges = []

  switch (node.kind) {
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.TypeParameter:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.ParenthesizedExpression:
      commentRanges.push(...(ts.getTrailingCommentRanges(text, node.pos) || []))
      break
  }

  commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []))

  /* eslint-disable unicorn/prefer-code-point */
  return commentRanges.filter(
    (comment) =>
      text.charCodeAt(comment.pos + 1) === ts.CharacterCodes.asterisk &&
      text.charCodeAt(comment.pos + 2) === ts.CharacterCodes.asterisk &&
      text.charCodeAt(comment.pos + 3) !== ts.CharacterCodes.slash
  )
}

const tsdocEmitter = new TSDocEmitter()

const parseValue = (content) => {
  if (!content) return

  const value = renderAsString(content)
  if (!value) return

  try {
    return JSON.parse(value)
  } catch {
    console.warn('Failed to parse sample value', value)
  }
}

const renderAsString = (value) => {
  if (!value) return

  const content = new StringBuilder()
  tsdocEmitter.renderDeclarationReference(content, value)
  return content.toString().trim()
}

/**
 * @param {DocComment} docComment
 * @param {string} tagName
 */
const getCustomBlock = (docComment, tagName) =>
  docComment.customBlocks.find(
    (block) => block.blockTag.tagNameWithUpperCase === tagName.toUpperCase()
  )

/**
 * @param {DocComment} docComment
 */
export const getDocCommentJson = (docComment) => {
  const sample = getCustomBlock(docComment, '@sample')?.content
  const example = getCustomBlock(docComment, '@example')?.content
  const remarks = docComment.remarksBlock?.content

  return {
    summary: renderAsString(docComment.summarySection),
    sample: parseValue(sample),
    remarks: renderAsString(remarks),
    example: renderAsString(example),
  }
}
