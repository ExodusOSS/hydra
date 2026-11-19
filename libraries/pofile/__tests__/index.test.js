const fs = require('fs')
const path = require('path')
const pofile = require('../src/index')

const data = fs.readFileSync(path.join(__dirname, './fixtures/test.po')).toString()

describe('pofile', () => {
  describe('parse', () => {
    test('should not crash', () => {
      expect(pofile.parse(data)).toBeTruthy()
    })

    test('should successfully parse simple po file', () => {
      const instance = pofile.parse(data)

      expect(instance.entries).toHaveLength(9)
      expect(instance.toString()).toMatchSnapshot()
    })
  })

  describe('create', () => {
    test('should not crash', () => {
      expect(pofile.create()).toBeTruthy()
    })
  })

  describe('api', () => {
    const expectEntryVariants = (method) => {
      expect(method('Enter password')).toBeTruthy()

      // variables
      expect(method('Buy {asset}')).toBeTruthy()
      expect(method('Buy {asset.name}')).toBeTruthy()
      expect(method('Buy {0}')).toBeTruthy()
    }

    test('should add entry successfully', () => {
      const instance = pofile.create()

      instance.addEntry({
        id: 'Welcome to Exodus',
        value: 'Bienvenido a Exodus',
        comments: ['Some comment'],
        flags: ['remote-config'],
      })

      expect(instance.entries).toHaveLength(1)
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should escape entry successfully', () => {
      const instance = pofile.create()

      instance.addEntry({
        id: 'Welcome to "Exodus"',
        value: 'Bienvenido a "Exodus"',
        comments: ['Some comment'],
        flags: ['remote-config'],
      })

      expect(instance.entries).toHaveLength(1)
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should escape literal newlines in id and value', () => {
      const instance = pofile.create()

      instance.addEntry({
        id: 'Line one\nLine two',
        value: 'Línea uno\nLínea dos',
      })

      const serialized = instance.toString()
      // Newlines are escaped, so every quoted string stays on one physical line.
      expect(serialized).toContain('msgid "Line one\\nLine two"')
      expect(serialized).toContain('msgstr "Línea uno\\nLínea dos"')
      expect(serialized).not.toMatch(/msgid "Line one\nLine two"/u)
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should serialize msgctxt before msgid (gettext spec order)', () => {
      const instance = pofile.create()

      instance.addEntry({
        id: 'Stake {asset.displayTicker}',
        value: 'Stake {asset.displayTicker}',
        context: 'stake.button',
      })

      const serialized = instance.toString()
      expect(serialized.indexOf('msgctxt')).toBeLessThan(serialized.indexOf('msgid'))
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should serialize an entry with no value as msgstr "" (not "undefined")', () => {
      const instance = pofile.create()

      instance.addEntry({ id: 'Untranslated' })

      const serialized = instance.toString()
      expect(serialized).toContain('msgstr ""')
      expect(serialized).not.toContain('msgstr "undefined"')
      // An empty msgstr reads back as '' (standard gettext "untranslated").
      expect(pofile.parse(serialized).entries[0].value).toBe('')
    })

    test('should add entry on top of existing file', () => {
      const instance = pofile.parse(data)

      instance.addEntry({
        id: 'Welcome to Exodus',
        value: 'Bienvenido a Exodus',
        comments: ['Some comment'],
      })

      expect(instance.entries).toHaveLength(10)
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should merge duplicated entry', () => {
      const instance = pofile.parse(data)

      instance.addEntry({ id: 'Unlock', references: ['src/ui/index.js '] })

      expect(instance.entries).toHaveLength(9)
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should merge entries with different placeholder variable names', () => {
      const instance = pofile.parse(data)

      instance.addEntry({
        id: '{some.object.nesting} balance',
        value: '{some.object.nesting} balance',
      })

      instance.addEntry({
        id: '{another-var-in-another-context} balance',
        value: '{another-var-in-another-context} balance',
      })

      expect(instance.entries).toHaveLength(10)
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should not add duplicated entry with different value', () => {
      const instance = pofile.parse(data)

      expect(() => instance.addEntry({ id: 'Unlock', value: 'Destrabar' })).toThrow(Error)
    })

    test('should tell if entry exists', () => {
      const instance = pofile.parse(data)

      expect(instance.exists('Unlock')).toBeTruthy()
      expect(instance.exists('Other')).toBeFalsy()

      expectEntryVariants(instance.exists)
    })

    test('should get entry by id', () => {
      const instance = pofile.parse(data)

      expect(instance.getEntry('Unlock')).toBeTruthy()

      expectEntryVariants(instance.getEntry)
    })

    test('should add comment to entry', () => {
      const instance = pofile.parse(data)

      instance.getEntry('Unlock').addComment('other comment')

      expect(instance.toString()).toMatchSnapshot()
    })

    test('should add reference to entry', () => {
      const instance = pofile.parse(data)

      instance.getEntry('Unlock').addReference('src/index.js')

      expect(instance.toString()).toMatchSnapshot()
    })

    test('should add flag to entry', () => {
      const instance = pofile.parse(data)

      instance.getEntry('Unlock').addFlag('remote-config')

      expect(instance.toString()).toMatchSnapshot()
    })
  })

  describe('round-trip', () => {
    // Values stay in raw PO-escaped form end to end: parse must not decode
    // escape sequences (runtime translation ids are computed from the raw
    // bytes, see #44002) and toString must write them back byte-for-byte.
    test('keeps two-char \\n escapes through parse → toString', () => {
      const source = 'msgid "line one\\nline two"\nmsgstr "ligne un\\nligne deux"'

      const entry = pofile.parse(source).entries[0]
      expect(entry.id).toBe('line one\\nline two')
      expect(entry.id.includes('\n')).toBe(false)
      expect(entry.value).toBe('ligne un\\nligne deux')

      expect(pofile.parse(source).toString()).toBe(source)
    })

    test('is byte-stable for escaped backslashes, quotes and msgctxt', () => {
      const source =
        'msgctxt "button.buy"\nmsgid "Say \\"hi\\" on\\nline \\\\"\nmsgstr "Dí \\"hola\\" en\\nlinea \\\\"'

      expect(pofile.parse(source).toString()).toBe(source)
    })

    test('quotes are normalized in memory and re-escaped on the wire', () => {
      const source = 'msgid "Click on \\"Submit\\" button"\nmsgstr "Click en \\"Submit\\""'

      const entry = pofile.parse(source).entries[0]
      expect(entry.id).toBe('Click on "Submit" button')
      expect(pofile.parse(source).toString()).toBe(source)
    })

    test('programmatic real control characters serialize escaped, then stay stable', () => {
      const written = pofile.create()
      written.addEntry({ id: 'Line one\nLine two', value: 'Línea uno\tfin\r' })

      const serialized = written.toString()
      expect(serialized).toBe('msgid "Line one\\nLine two"\nmsgstr "Línea uno\\tfin\\r"')

      const reparsed = pofile.parse(serialized)
      expect(reparsed.entries[0].id).toBe('Line one\\nLine two')
      expect(reparsed.toString()).toBe(serialized)
    })

    test('JS template-literal escapes in ids round-trip byte-exact (EOS backtick key)', () => {
      const source =
        'msgid "The EOS account \\`{toAccountName}\\` must exist in order to send your tokens"\nmsgstr ""'

      const entry = pofile.parse(source).entries[0]
      expect(entry.id).toBe(
        'The EOS account \\`{toAccountName}\\` must exist in order to send your tokens'
      )
      expect(pofile.parse(source).toString()).toBe(source)
    })

    test('preserves msgctxt and keeps it ahead of msgid', () => {
      const written = pofile.create()
      written.addEntry({
        id: 'Stake {asset.displayTicker}',
        value: 'Stake {asset.displayTicker}',
        context: 'stake.button',
      })

      const serialized = written.toString()
      const reparsed = pofile.parse(serialized).entries[0]

      expect(serialized.indexOf('msgctxt')).toBeLessThan(serialized.indexOf('msgid'))
      expect(reparsed.context).toBe('stake.button')
      expect(reparsed.id).toBe('Stake {asset.displayTicker}')
    })
  })

  describe('regressions', () => {
    test('parses a trailing escaped backslash before a closing quote (Invalid char: <)', () => {
      // 3.3.1 mis-tracked the escape state on `\\` and swallowed the closing
      // quote, crashing on the following <0> tag — the Lokalise task 3818517
      // download failure.
      const source =
        'msgid ""\nmsgstr ""\n"Language: ru"\n\nmsgid "test \\\\"\nmsgstr "<0>hello</0>"\n'

      const { entries } = pofile.parse(source)
      expect(entries).toHaveLength(1)
      expect(entries[0].id).toBe('test \\\\')
      expect(entries[0].value).toBe('<0>hello</0>')
    })

    test('multiline ids keep the two characters the runtime keys on (#44002)', () => {
      const source =
        'msgid "To restore your wallet:\\n1. Open the app"\nmsgstr "Para restaurar:\\n1. Abre la app"'

      const entry = pofile.parse(source).entries[0]
      expect(entry.id).toBe('To restore your wallet:\\n1. Open the app')
      expect(entry.uniqueId).toBe(pofile.computeId('To restore your wallet:\\n1. Open the app'))
    })

    test('a value spread over several quoted lines fails fast (Lokalise line-split translations)', () => {
      // Lokalise exports a translation that contains a line break as two
      // physical lines with no `\n` escape; gettext-style concatenation would
      // silently drop the line break and glue the words together.
      const source = [
        'msgid "Tap Continue to accept <0>{bank.name}\\nPrivacy Policy</0>"',
        'msgstr "Tippen Sie auf „Weiter“, um die <0>{bank.name}"',
        '"Datenschutzerklärung</0> zu akzeptieren"',
      ].join('\n')

      expect(() => pofile.parse(source)).toThrow(
        'pofile: wrapped strings are not supported ("msgstr")'
      )
    })

    test('unsupported comment markers fail fast instead of being folded or swallowed', () => {
      expect(() => pofile.parse('#. developer note\nmsgid "a"\nmsgstr "b"')).toThrow(
        'pofile: unsupported comment marker "#."'
      )
      expect(() => pofile.parse('#~ msgid "Removed"\n#~ msgstr "Eliminado"')).toThrow(
        'pofile: unsupported comment marker "#~"'
      )
      expect(() => pofile.parse('# note\n#\nmsgctxt "ctx"\nmsgid "a"\nmsgstr "b"')).toThrow(
        'pofile: unsupported comment marker "#\\n"'
      )
    })

    test('a header with leading translator comments and flags is still dropped', () => {
      const source = [
        '# Translators:',
        '#, fuzzy',
        'msgid ""',
        'msgstr ""',
        '"Language: de\\n"',
        '',
        'msgid "Live"',
        'msgstr "Lebendig"',
      ].join('\n')

      const file = pofile.parse(source)
      expect(file.entries).toHaveLength(1)
      expect(file.entries[0].id).toBe('Live')
    })

    test('a name without a following quoted string fails fast', () => {
      expect(() => pofile.parse('msgid "Ok"\nmsgstr')).toThrow(
        'pofile: expected a quoted string after "msgstr"'
      )
    })

    test('a section without msgid fails fast instead of being dropped', () => {
      expect(() => pofile.parse('msgstr "orphan"')).toThrow('pofile: entry id must be a string')
    })

    test('a non-header empty msgid fails fast instead of being dropped', () => {
      const source =
        'msgid ""\nmsgstr ""\n"Language: de"\n\nmsgctxt "ctx"\nmsgid ""\nmsgstr "value"'

      expect(() => pofile.parse(source)).toThrow('pofile: entry id must be a non-empty string')
    })
  })
})
