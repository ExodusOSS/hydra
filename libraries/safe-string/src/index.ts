import indexToSafeArg from './allowlist.js'

const safeArgAllowlist = new Map(indexToSafeArg.map((v, i) => [v, i]))

const nonInterpolableAllowlist = new Set<string>()

const safeArgsInfix = ' ; SafeArgs: '

const MAX_INTERPOLATED_VALUES = 2

export function safeString(strings: TemplateStringsArray, ...values: unknown[]) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!strings.raw) {
    throw new TypeError(
      // eslint-disable-next-line no-template-curly-in-string
      "Should only be used as a tagged template literal, e.g., safeString`my message ${'this value will be redacted in production'}`"
    )
  }

  if (values.length > MAX_INTERPOLATED_VALUES) {
    throw new Error(`safeString only supports up to ${MAX_INTERPOLATED_VALUES} interpolated values`)
  }

  if (process.env.NODE_ENV === 'development') {
    // for `prefix ${'value1'} infix ${'value2'} suffix`
    // strings is ['prefix ', ' infix ', ' suffix']
    // values is ['value1', 'value2']
    return [strings[0], ...values.flatMap((arg, i) => [arg, strings[i + 1]])].join('')
  }

  const templatePart = strings.join('<redacted>')
  if (
    values.length === 0 && // complex templates are not arguments
    templatePart.length > 1 && // single letters are likely to be accidentally misused
    `${Number(templatePart)}` !== templatePart // numbers are likely to be accidentally misused
  ) {
    if (!safeArgAllowlist.has(templatePart)) {
      // safe to interpolate into other strings
      safeArgAllowlist.set(templatePart, indexToSafeArg.length)
      indexToSafeArg.push(templatePart)
    }
  } else {
    nonInterpolableAllowlist.add(templatePart)
  }

  return values.length > 0
    ? templatePart +
        safeArgsInfix +
        JSON.stringify(values.map((value) => safeArgAllowlist.get(String(value)) ?? -1))
    : templatePart
}

export function parseString(value: string) {
  if (isSafe(value)) return value

  const [template, stringifiedValueIndexes] = value.split(safeArgsInfix)
  if (!isSafe(template as string)) return ''

  let valueIndexes: number[] = []
  try {
    valueIndexes = stringifiedValueIndexes ? JSON.parse(stringifiedValueIndexes) : []
  } catch {}

  const mappedValues: (string | undefined)[] = valueIndexes.map((i) =>
    Number.isSafeInteger(i) && i >= 0 && i < indexToSafeArg.length ? indexToSafeArg[i]! : undefined
  )

  // interpolate values back into the template
  let i = 0
  return (template as string).replace(/<redacted>/gu, () => {
    return mappedValues[i++] ?? '<redacted>'
  })
}

export function isSafe(value: string) {
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  return safeArgAllowlist.has(value) || nonInterpolableAllowlist.has(value)
}

export function getAllowlist() {
  return [...indexToSafeArg, ...nonInterpolableAllowlist]
}
