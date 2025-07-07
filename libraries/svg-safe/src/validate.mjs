// This is a very simple tokenizer with a primary aim of parsing very simple SVG files
// to verify that those are sanitized afterwards

// It's minimalistic by a design goal. Supporting all the XML/SVG files out there is not a goal

const assert = (ok, message) => {
  if (!message) {
    throw new Error('BUG! assertion message is expected')
  }

  if (!ok) {
    throw new Error(message)
  }
}

function tokenizeFile(raw) {
  // Splits file into xml tags or text content
  assert(typeof raw === 'string', 'tokenizeFile: raw is not a string')
  const tokens = []
  let i = 0
  while (i < raw.length) {
    let j = raw.indexOf('<', i)
    if (j === i) {
      j = raw.indexOf('>', i)
      assert(j > i, 'tokenizeFile: > expected')
      j++
    } else if (j === -1) {
      j = raw.length
    }

    tokens.push(raw.slice(i, j))
    i = j
  }

  // Verify that we missed no characters
  assert(tokens.join('') === raw, 'tokenizeFile: characters are missing')
  return tokens
}

function tokenizeLine(raw) {
  // Splits file into xml tags or text content
  assert(typeof raw === 'string', 'tokenizeLine: raw is not a string')
  assert(raw.startsWith('<') && raw.endsWith('>'), 'tokenizeLine: invalid raw start/end tags')
  let i = raw.indexOf(' ')
  if (i < 0) i = raw.length - 1
  const tokens = []
  tokens.push(raw.slice(1, i))
  while (i < raw.length - 1) {
    let j = raw.indexOf('"', i)
    if (j === -1) {
      j = raw.length - 1
      if (i !== j) tokens.push(raw.slice(i, j))
      i = j
    } else {
      assert(j > i, 'tokenizeLine: invalid j > i')
      const k = raw.indexOf('"', j + 1)
      assert(k > j, 'tokenizeLine: invalid k > j')
      tokens.push(raw.slice(i, k + 1))
      i = k + 1
    }
  }

  // Verify that we missed no characters
  assert(`<${tokens.join('')}>` === raw, 'tokenizeLine: missed characters')
  return tokens
}

/*
   (\.\d+|\d+(\.\d*)?)      -- non-negative numeric
  -(\.\d+|\d+(\.\d*)?)      -- maybe-negative numeric
   (#[a-fA-F0-9]+|[a-z]+)   -- color
*/

function isTransform(value) {
  // eslint-disable-next-line sonarjs/regex-complexity
  return /^((translate|rotate|scale|matrix)\(-?(\.\d+|\d+(\.\d*)?)((, *| |)-?(\.\d+|\d+(\.\d*)?)){0,5}\) *){1,6}$/u.test(
    value
  )
}

// Note: tag -> option map is not ideal (e.g. linearGradient/radialGradient is loose),
// but it is kept that way for clarity of the code
// The main intention is to block unknown tags / values
function validateOption(tag, option) {
  if (/^id="[\w:-]+"$/u.test(option)) return
  if (['path', 'stop', 'circle', 'ellipse', 'rect'].includes(tag) && option === '/') return
  if (tag === '?xml' && option === '?') return
  if (option === '/') return

  const match = option.match(/^([\d:a-z-]+)="([\w =#%(),./:;+-]+)"$/iu)
  assert(match, `validateOption: invalid option ${option} regex`)
  // Enforce general form

  const [, name, value] = match
  assert(option === `${name}="${value}"`, `validateOption: invalid option ${option} assignment`) // Verify that we missed no characters

  if (tag === 'svg') {
    if (option === 'xmlns="http://www.w3.org/2000/svg"') return
    if (option === 'xmlns:xlink="http://www.w3.org/1999/xlink"') return
    if (/^version="\d.\d"$/u.test(option)) return
    if (/^(width|height)="(\.\d+|\d+(\.\d*)?)(%|px)?"$/u.test(option)) return
    // eslint-disable-next-line sonarjs/regex-complexity
    if (/^viewBox="(\.\d+|\d+(\.\d*)?)(( |, *)(\.\d+|\d+(\.\d*)?)){3}"$/u.test(option)) return
    if (/^data-name="Layer \d+"$/u.test(option)) return
    if (/^style="enable-background:new 0 0( (\.\d+|\d+(\.\d*)?)){2};"$/u.test(option)) return
    if (/^(x|y)="0(px)?"$/u.test(option)) return
    if (/^xml:space="preserve"$/u.test(option)) return
  }

  if (['path', 'g', 'circle', 'ellipse', 'rect', 'mask', 'svg'].includes(tag)) {
    if (/^(fill|clip)-rule="(nonzero|evenodd)"$/u.test(option)) return
    if (/^stroke-(linejoin|linecap)="round"$/u.test(option)) return
    if (/^(stroke-(width|miterlimit)|(fill-)?opacity)="(\.\d+|\d+(\.\d*)?)"$/u.test(option)) return
    if (/^(fill|stroke)="(#[\dA-Fa-f]+|[a-z]+)"$/u.test(option)) return
    if (/^style="fill:(#[\dA-Fa-f]+|[a-z]+);"$/u.test(option)) return
    if (/^style="mix-blend-mode:color"$/u.test(option)) return
    if (/^style="mix-blend-mode:overlay"$/u.test(option)) return
    if (/^(width|height)="(\.\d+|\d+(\.\d*)?)(%|px)?"$/u.test(option)) return
    if (name === 'transform' && isTransform(value)) return
  }

  if (
    ['path', 'g', 'circle', 'ellipse', 'rect'].includes(tag) &&
    /^(fill|stroke|mask|filter|clip-path)="url\(#[\w:-]+\)"$/u.test(option)
  )
    return
  if (tag === 'stop') {
    if (/^offset="(\.\d+|\d+(\.\d*)?)%?"$/u.test(option)) return
    if (/^stop-color="(#[\dA-Fa-f]+|[a-z]+)"$/u.test(option)) return
    if (/^stop-opacity="(\.\d+|\d+(\.\d*)?)"$/u.test(option)) return
  }

  if (['linearGradient', 'radialGradient'].includes(tag)) {
    if (/^(x1|x2|y1|y2)="-?(\.\d+|\d+(\.\d*)?)(e-\d+)?%?"$/u.test(option)) return
    if (/^(fx|fy|cx|cy|r)="-?(\.\d+|\d+(\.\d*)?)(e-\d+)?%?"$/u.test(option)) return
    if (/^gradientUnits="(userSpaceOnUse|objectBoundingBox)"$/u.test(option)) return
    if (name === 'gradientTransform' && isTransform(value)) return
  }

  if (
    ['circle', 'ellipse', 'radialGradient'].includes(tag) &&
    /^(cx|cy|rx|ry|r)="(\.\d+|\d+(\.\d*)?)"$/u.test(option)
  )
    return
  if (tag === 'pattern' && /^patternContentUnits="(objectBoundingBox)"$/u.test(option)) return
  if (tag === 'mask') {
    if (/^mask-type="(alpha)"$/u.test(option)) return
    if (/^maskUnits="(userSpaceOnUse)"$/u.test(option)) return
    if (/^style="mask-type:alpha"$/u.test(option)) return
  }

  if (['mask', 'rect', 'pattern'].includes(tag)) {
    if (/^(width|height|rx)="(\.\d+|\d+(\.\d*)?)"$/u.test(option)) return
    if (/^(x|y)="-?(\.\d+|\d+(\.\d*)?)"$/u.test(option)) return
  }

  if (tag === 'path' && name === 'd') {
    assert(value.length <= 50_000, `${tag} <path> too long`)
    if (/^[\d ,.ACHLMQSTVZacehlmqstvz-]+$/u.test(value)) return
  }

  if (tag === 'image') {
    if (/^(width|height)="(\.\d+|\d+(\.\d*)?)(%|px)?"$/u.test(option)) return
    if (/^(x|y)="(\.\d+|\d+(\.\d*)?)(%|px)?"$/u.test(option)) return
    if (
      (name === 'href' || name === 'xlink:href') &&
      /^(data:image\/(png|jpeg);base64,[\d+/A-Za-z=]+={0,2})$/u.test(value)
    )
      return
    if (/^(clip-path)="url\(#[\w:-]+\)"$/u.test(option)) return
  }

  if (tag === '?xml') {
    if (['version="1.0"', '?', 'standalone="no"'].includes(option)) return
    if (/^encoding="(utf-8|iso-8859-1)"$/iu.test(option)) return
  }

  if (tag === 'use') {
    if ((name === 'href' || name === 'xlink:href') && /^#[\w:-]+$/u.test(value)) return
    if (name === 'transform' && isTransform(value)) return
    if (/^(fill|stroke)="(#[\dA-Fa-f]+|[a-z]+)"$/u.test(option)) return
  }

  if (
    ['feColorMatrix', 'feFlood', 'feBlend', 'feOffset', 'feGaussianBlur', 'feComposite'].includes(
      tag
    )
  ) {
    if (/^values="([\d \\.]+)"$/u.test(option)) return
    if (/^flood-opacity="\d+"$/u.test(option)) return
    if (/^(in|in2|result|operator)="(\w+)"$/u.test(option)) return
    if (/^(dy|k2|k3)="(-?\d+)"$/u.test(option)) return
    if (/^stdDeviation="(\d+)"$/u.test(option)) return
  }

  if (tag === 'filter') {
    if (option === 'color-interpolation-filters="auto"') return
    if (/^(x|y)="-?(\.\d+|\d+(\.\d*)?)"$/u.test(option)) return
    if (/^(width|height)="(\.\d+|\d+(\.\d*)?)(%|px)?"$/u.test(option)) return
    if (option === 'filterUnits="userSpaceOnUse"') return
    if (option === 'color-interpolation-filters="sRGB"') return
  }

  assert(
    false,
    `validateOption: unexpected svg element "${tag}" and attribute "${name}" , value ${value}`
  )
}

const tags = [
  'svg',
  'defs',
  'linearGradient',
  'radialGradient',
  'stop',
  'g',
  'path',
  'circle',
  'ellipse',
  'rect',
  'clipPath',
  'use',
  'mask',
  'pattern',
  'image',
  'style',
  'filter',
  'feColorMatrix',
  'feFlood',
  'feBlend',
  'feOffset',
  'feGaussianBlur',
  'feComposite',
]
const allTags = new Set(['?xml', ...tags, ...tags.map((t) => `/${t}`), ...tags.map((t) => `${t}/`)])

export function validate(raw) {
  assert(typeof raw === 'string', `validate: raw is not a string`)
  assert(!/['`]/u.test(raw), `validate: "${raw}" is not valid`) // just an extra check
  for (const token of tokenizeFile(raw)) {
    if (token.trim() === '') continue
    const [tag, ...options] = tokenizeLine(token)
    assert(allTags.has(tag), `validate: invalid tag "${tag}"`)
    if (tag.startsWith('/')) assert(options.length === 0, `validate: "${tag}" starts with /`)
    for (const option of options) validateOption(tag, option.replace(/^ +/u, ''))
  }
}
