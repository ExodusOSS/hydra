import createCountdownLock from '../src/countdown-lock.js'

describe('countdown lock', () => {
  test('expects strings array', () => {
    expect(() => createCountdownLock(undefined as never)).toThrow(/array/)
    expect(() => createCountdownLock(-1 as never)).toThrow(/array/)
    expect(() => createCountdownLock(['a', -1 as never])).toThrow(/all strings/)
  })

  test('unlocks on all keys unlock', () => {
    const lock = createCountdownLock(['a', 'b', 'c'])
    expect(lock.unlock('a')).toEqual(false)
    expect(lock.unlock('a')).toEqual(false)
    expect(lock.unlock('b')).toEqual(false)
    expect(lock.unlock('b')).toEqual(false)
    expect(lock.unlock('c')).toEqual(true)
  })

  test('does not count keys not in original keys array', () => {
    const lock = createCountdownLock(['a', 'b'])
    expect(lock.unlock('x')).toEqual(false)
    expect(lock.unlock('y')).toEqual(false)
    // Lock should not resolve — 'a' and 'b' were never unlocked
    expect(lock.unlock('a')).toEqual(false)
    expect(lock.unlock('b')).toEqual(true)
  })

  test('stays unlocked after unlock', () => {
    const lock = createCountdownLock(['a'])
    expect(lock.unlock('a')).toEqual(true)
    expect(lock.unlock('a')).toEqual(true)
  })

  test('lock.promise resolves after unlock', async () => {
    const lock = createCountdownLock(['a', 'b'])
    const onUnlock = jest.fn()
    void lock.promise.then(onUnlock)
    lock.unlock('a')
    await new Promise(setImmediate)
    expect(onUnlock).not.toHaveBeenCalled()

    lock.unlock('b')
    await new Promise(setImmediate)
    expect(onUnlock).toHaveBeenCalled()
  })

  test('handles duplicate keys by deduplicating', () => {
    const lock = createCountdownLock(['a', 'a', 'b'])
    expect(lock.unlock('a')).toEqual(false)
    expect(lock.unlock('b')).toEqual(true)
  })

  test('lock.promise resolves with duplicate keys', async () => {
    const lock = createCountdownLock(['a', 'a', 'b', 'c', 'c'])
    const onUnlock = jest.fn()
    void lock.promise.then(onUnlock)

    lock.unlock('a')
    await new Promise(setImmediate)
    expect(onUnlock).not.toHaveBeenCalled()

    lock.unlock('b')
    await new Promise(setImmediate)
    expect(onUnlock).not.toHaveBeenCalled()

    lock.unlock('c')
    await new Promise(setImmediate)
    expect(onUnlock).toHaveBeenCalled()
  })
})
