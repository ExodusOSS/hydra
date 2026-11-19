import createKeystore from '../index.js'
import createKeychainMock from './keychain-mock.js'

describe('keystore', () => {
  let keystore
  let reactNativeKeychain

  beforeEach(() => {
    reactNativeKeychain = createKeychainMock()
    keystore = createKeystore({ reactNativeKeychain, platform: 'ios' })
  })

  it('returns undefined if value not found', async () => {
    await expect(keystore.getSecret('voldemort')).resolves.toEqual(undefined)
  })

  it('rejects null/undefined values in set()', async () => {
    await expect(keystore.setSecret('dobby', null)).rejects.toThrow()
    await expect(keystore.setSecret('dobby')).rejects.toThrow()
  })

  it('sets, gets, deletes', async () => {
    await keystore.setSecret('voldemort kills', 'everyone')
    await expect(keystore.getSecret('voldemort kills')).resolves.toEqual('everyone')
    expect(reactNativeKeychain.setInternetCredentials).toHaveBeenCalledWith(
      'voldemort kills',
      'unused',
      '"everyone"',
      { accessible: 2 }
    )
    await keystore.deleteSecret('voldemort kills')
    await expect(keystore.getSecret('voldemort kills')).resolves.toEqual(undefined)
  })

  it('deleting nonexistent key is noop', async () => {
    await expect(keystore.deleteSecret('voldergard')).resolves.not.toThrow()
  })

  it('stringifies and parses JSON', async () => {
    await keystore.setSecret('voldemort kills', { who: 'everyone' })
    await expect(keystore.getSecret('voldemort kills')).resolves.toEqual({ who: 'everyone' })
  })

  it('waits for unlocked to return true before get / set / delete', async () => {
    keystore.lock()
    keystore.getSecret('voldemort kills')
    keystore.setSecret('voldemort kills', 'everyone')
    keystore.deleteSecret('voldemort kills')
    await new Promise(setImmediate)
    expect(reactNativeKeychain.getInternetCredentials).not.toBeCalled()
    expect(reactNativeKeychain.setInternetCredentials).not.toBeCalled()
    expect(reactNativeKeychain.resetInternetCredentials).not.toBeCalled()
    keystore.unlock()
    await new Promise(setImmediate)
    expect(reactNativeKeychain.getInternetCredentials).toBeCalled()
    expect(reactNativeKeychain.setInternetCredentials).toBeCalled()
    expect(reactNativeKeychain.resetInternetCredentials).toBeCalled()
  })

  it('allows custom options', async () => {
    keystore = createKeystore({
      reactNativeKeychain,
      platform: 'ios',
      options: { accessible: reactNativeKeychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    })

    await keystore.setSecret('voldemort kills', 'everyone')
    expect(reactNativeKeychain.setInternetCredentials).toHaveBeenCalledWith(
      'voldemort kills',
      'unused',
      '"everyone"',
      { accessible: 3 }
    )
  })

  it('reads without authenticationPrompt when unconfigured', async () => {
    await keystore.getSecret('voldemort kills')
    expect(reactNativeKeychain.getInternetCredentials).toHaveBeenCalledWith('voldemort kills', {})
  })

  it('passes configured authenticationPrompt object to reads', async () => {
    const authenticationPrompt = { title: 'Prove yourself' }
    keystore = createKeystore({ reactNativeKeychain, platform: 'ios', authenticationPrompt })

    await keystore.getSecret('voldemort kills')
    expect(reactNativeKeychain.getInternetCredentials).toHaveBeenCalledWith('voldemort kills', {
      authenticationPrompt,
    })
  })

  it('evaluates authenticationPrompt function on every read', async () => {
    let title = 'Prove yourself'
    keystore = createKeystore({
      reactNativeKeychain,
      platform: 'ios',
      authenticationPrompt: () => ({ title }),
    })

    await keystore.getSecret('voldemort kills')
    expect(reactNativeKeychain.getInternetCredentials).toHaveBeenLastCalledWith('voldemort kills', {
      authenticationPrompt: { title: 'Prove yourself' },
    })

    title = 'Demuestra quien eres'
    await keystore.getSecret('voldemort kills')
    expect(reactNativeKeychain.getInternetCredentials).toHaveBeenLastCalledWith('voldemort kills', {
      authenticationPrompt: { title: 'Demuestra quien eres' },
    })
  })

  it('rejects invalid authenticationPrompt config', () => {
    for (const authenticationPrompt of ['title', null, ['title']]) {
      expect(() =>
        createKeystore({ reactNativeKeychain, platform: 'ios', authenticationPrompt })
      ).toThrow('authenticationPrompt must resolve to an object or undefined')
    }
  })

  it('rejects authenticationPrompt function resolving to a non-object', async () => {
    keystore = createKeystore({
      reactNativeKeychain,
      platform: 'ios',
      authenticationPrompt: () => 'title',
    })

    await expect(keystore.getSecret('voldemort kills')).rejects.toThrow(
      'authenticationPrompt must resolve to an object or undefined'
    )
    expect(reactNativeKeychain.getInternetCredentials).not.toBeCalled()
  })

  it('defaults to locked', async () => {
    const keystore = createKeystore({
      reactNativeKeychain: createKeychainMock(),
      platform: 'ios',
      isLockedInitially: true,
    })

    void keystore.getSecret('voldemort kills')
    await new Promise(setImmediate)
    expect(reactNativeKeychain.getInternetCredentials).not.toBeCalled()
  })
})
