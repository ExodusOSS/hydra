/* eslint-env jest */
const suite = require('@exodus/storage-spec')
const tempy = require('tempy')
const { createStorage } = require('.')

jest.mock('scryptsy', () => ({
  __esModule: true,
  default: (...args) => {
    const length = args.pop()
    const crypto = require('crypto')
    const hash = crypto.createHash('sha256').update(args.join(':')).digest().slice(0, length)
    return hash.length === length
      ? hash
      : Buffer.concat([hash, Buffer.alloc(length - hash.length).fill(0)])
  },
}))

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
