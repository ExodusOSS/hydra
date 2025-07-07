/* eslint-env jest */
const suite = require('@exodus/storage-spec')
const tempy = require('tempy')
const { createStorage } = require('.')

jest.exodus.mock.timersSpeedup(100)

const customSuite = (opts = {}) => {
  test('persistance works', async () => {
    const file = tempy.file({ extension: 'json' })
    const storage1 = createStorage({ file, ...opts })
    await storage1.set('foo', 'bar')
    const storage2 = createStorage({ file, ...opts })
    expect(await storage2.get('foo')).toBe('bar')
  })
  test('prototype issues', async () => {
    const file = tempy.file({ extension: 'json' })
    const storage = createStorage({ file, ...opts })
    expect(await storage.get('__proto__')).toBe(undefined)
    await storage.set('__proto__', [])
    expect(await storage.get('slice')).toBe(undefined)
  })
}

suite({
  factory: () => createStorage({ file: tempy.file({ extension: 'json' }) }),
})

customSuite()
