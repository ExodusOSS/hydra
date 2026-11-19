import createLogger from '@exodus/logger'
import createStorageMemory from '@exodus/storage-memory'

const def = (id: string, value: unknown) => ({
  definition: {
    id,
    type: 'module',
    factory: () => value,
    public: true,
  },
})

export const atom = <T>(value: T) => {
  return {
    observe: (cb: (value: T) => void) => {
      cb(value)
      return () => {}
    },
    get: async () => value,
  }
}

export const dependencies = [
  def('logger', createLogger()),
  def('config', {}),
  def('port', { emit: () => {} }),
  def('fetch', {}),
  def('validateAnalyticsEvent', () => true),
  def('getBuildMetadata', () => ({})),
  def('unsafeStorage', createStorageMemory()),
  def('fusion', {
    subscribe: () => {},
    getProfile: () => {},
  }),
  def('lockedAtom', atom(false)),
  def('primarySeedIdAtom', atom('my-seed')),
  def('enabledWalletAccountsAtom', atom({})),
  def('keychain', {}),
]
