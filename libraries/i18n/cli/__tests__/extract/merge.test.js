import mergeLocale from '../../extract/merge.js'

describe('merge', () => {
  test('should merge entries on empty locale file', () => {
    const fileManager = { read: jest.fn(() => ({ entries: [] })), write: jest.fn() }

    const entries = [
      { id: "Philosopher's Stone", reference: 'fixtures/everything.js:6' },
      { id: 'Chamber of Secrets', reference: 'fixtures/everything.js:7' },
    ]

    mergeLocale(entries, { file: 'es' }, fileManager)

    expect(fileManager.write.mock.calls[0][1].entries).toEqual([
      {
        comments: [],
        flags: [],
        id: "Philosopher's Stone",
        references: ['fixtures/everything.js:6'],
        uniqueId: "Philosopher's Stone",
        value: '',
      },
      {
        comments: [],
        flags: [],
        id: 'Chamber of Secrets',
        references: ['fixtures/everything.js:7'],
        uniqueId: 'Chamber of Secrets',
        value: '',
      },
    ])
  })

  test('should preserve static entries existing data', () => {
    const currentEntries = [
      {
        comments: [],
        flags: [],
        id: 'Chamber of Secrets',
        references: ['fixtures/everything.js:7'],
        value: 'La Camara de los Secretos',
        uniqueId: 'Chamber of Secrets',
      },
    ]

    const fileManager = { read: jest.fn(() => ({ entries: currentEntries })), write: jest.fn() }

    const entries = [
      { id: "Philosopher's Stone", reference: 'fixtures/everything.js:6' },
      { id: 'Chamber of Secrets', reference: 'fixtures/everything.js:7' },
    ]

    mergeLocale(entries, { file: 'es' }, fileManager)

    expect(fileManager.write.mock.calls[0][1].entries).toEqual([
      {
        comments: [],
        flags: [],
        id: 'Chamber of Secrets',
        references: ['fixtures/everything.js:7'],
        value: 'La Camara de los Secretos',
        uniqueId: 'Chamber of Secrets',
      },
      {
        comments: [],
        flags: [],
        id: "Philosopher's Stone",
        references: ['fixtures/everything.js:6'],
        value: '',
        uniqueId: "Philosopher's Stone",
      },
    ])
  })

  test('should preserve dynamic entries existing data', () => {
    const currentEntries = [
      {
        comments: [],
        flags: [],
        id: 'Book {number}',
        references: ['fixtures/everything.js:6'],
        value: 'Libro {number}',
        uniqueId: 'Book {}',
      },
    ]

    const fileManager = { read: jest.fn(() => ({ entries: currentEntries })), write: jest.fn() }

    const entries = [{ id: 'Book {number}', reference: 'fixtures/everything.js:7' }]

    mergeLocale(entries, { file: 'es' }, fileManager)

    expect(fileManager.write.mock.calls[0][1].entries).toEqual([
      {
        comments: [],
        flags: [],
        id: 'Book {number}',
        references: ['fixtures/everything.js:7'],
        value: 'Libro {number}',
        uniqueId: 'Book {}',
      },
    ])
  })

  test('should use the same entry for the same computed id', () => {
    const currentEntries = [
      {
        comments: [],
        flags: [],
        id: 'Book {number}',
        references: ['fixtures/everything.js:7'],
        value: 'Libro {number}',
        uniqueId: 'Book {}',
      },
    ]

    const fileManager = { read: jest.fn(() => ({ entries: currentEntries })), write: jest.fn() }

    const entries = [
      { id: 'Book {number}', reference: 'fixtures/everything.js:7' },
      { id: 'Book {id}', reference: 'fixtures/hogwarts.js:42' },
    ]

    mergeLocale(entries, { file: 'es' }, fileManager)

    expect(fileManager.write.mock.calls[0][1].entries).toEqual([
      {
        comments: [],
        flags: [],
        id: 'Book {number}',
        references: ['fixtures/everything.js:7', 'fixtures/hogwarts.js:42'],
        value: 'Libro {number}',
        uniqueId: 'Book {}',
      },
    ])
  })
})
