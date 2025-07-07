const commonErrors = [
  {
    pattern: /.* is not a function/iu,
    normalized: 'Value is not a function',
  },
  {
    pattern: /.* is not a constructor/iu,
    normalized: 'Value is not a constructor',
  },
  {
    pattern: /cannot convert null to object/iu,
    normalized: 'Cannot convert null to object',
  },
  {
    pattern: /cannot convert undefined to object/iu,
    normalized: 'Cannot convert undefined to object',
  },
  {
    pattern: /cannot read (property|properties).* of null/iu,
    normalized: 'Cannot read property/properties of null',
  },
  {
    pattern: /cannot read (property|properties).* of undefined/iu,
    normalized: 'Cannot read property/properties of undefined',
  },
  {
    pattern: /cannot set (property|properties).* of null/iu,
    normalized: 'Cannot set property/properties of null',
  },
  {
    pattern: /cannot set (property|properties).* of undefined/iu,
    normalized: 'Cannot set property/properties of undefined',
  },
  {
    pattern: /undefined is not an object \(evaluating '.*'\)/iu,
    normalized: 'Cannot access property of undefined',
  },
  {
    pattern: /null is not an object \(evaluating '.*'\)/iu,
    normalized: 'Cannot access property of null',
  },
  {
    pattern: /unexpected (token|character)/iu,
    normalized: 'Unexpected token',
  },
  {
    pattern: /unexpected end of( JSON)? input/iu,
    normalized: 'Unexpected end of input',
  },
] as const

export type CommonErrorString = (typeof commonErrors)[number]['normalized']

export function toCommonErrorMessage(errorMessage: string): CommonErrorString | undefined {
  if (!errorMessage) return

  for (const { pattern, normalized } of commonErrors) {
    if (pattern.test(errorMessage)) {
      return normalized
    }
  }
}
