const { escapeRawValue } = require('../src/escape')

describe('escapeRawValue', () => {
  describe('keeps raw escape sequences byte-for-byte', () => {
    // Runtime translation ids are computed from these bytes (see #44002):
    // a value parsed from a .po file must serialize back unchanged.
    const cases = [
      ['two-char newline', 'line one\\nline two'],
      ['two-char tab', 'col1\\tcol2'],
      ['escaped backslash', 'C:\\\\Users'],
      ['escaped backslash before n (not a newline)', 'C:\\\\next'],
      ['trailing escaped backslash', 'ends with \\\\'],
      ['JS backtick escape from a template-literal id', 'The EOS account \\`{name}\\` must exist'],
      ['non-gettext escape', 'C:\\Users'],
      ['plain text', 'no special characters'],
      ['empty string', ''],
      ['placeholder tags', '<0>Tap {asset.name}</0>'],
    ]

    test.each(cases)('%s', (_label, raw) => {
      expect(escapeRawValue(raw)).toBe(raw)
    })
  })

  describe('escapes characters that would break the quoted line', () => {
    const cases = [
      ['double quote', 'Say "hi"', 'Say \\"hi\\"'],
      ['real newline', 'line one\nline two', 'line one\\nline two'],
      ['real carriage return', 'a\rb', 'a\\rb'],
      ['real tab', 'a\tb', 'a\\tb'],
      ['real newline after a two-char newline', 'a\\n\nb', 'a\\n\\nb'],
    ]

    test.each(cases)('%s', (_label, input, expected) => {
      expect(escapeRawValue(input)).toBe(expected)
    })
  })

  test('quote-free output is a fixed point: escaping twice equals escaping once', () => {
    const inputs = ['line one\nline two', 'a\\n\\t\\\\b', 'The EOS account \\`{name}\\`']

    for (const input of inputs) {
      const once = escapeRawValue(input)
      expect(escapeRawValue(once)).toBe(once)
    }
  })
})
