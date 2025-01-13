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

      expect(instance.entries).toHaveLength(7)
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

    test('should add entry on top of existing file', () => {
      const instance = pofile.parse(data)

      instance.addEntry({
        id: 'Welcome to Exodus',
        value: 'Bienvenido a Exodus',
        comments: ['Some comment'],
      })

      expect(instance.entries).toHaveLength(8)
      expect(instance.toString()).toMatchSnapshot()
    })

    test('should merge duplicated entry', () => {
      const instance = pofile.parse(data)

      instance.addEntry({ id: 'Unlock', references: ['src/ui/index.js '] })

      expect(instance.entries).toHaveLength(7)
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

      expect(instance.entries).toHaveLength(8)
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
})
