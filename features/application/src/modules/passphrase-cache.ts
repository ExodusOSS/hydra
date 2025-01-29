import ms from 'ms'
import type { Definition } from '@exodus/dependency-types'
import type { Storage } from '@exodus/storage-interface'
import type { Atom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'
import type { Alarms } from '../utils/types.js'

const TTL_KEY = 'ttl'
const PASSPHRASE_KEY = 'passphrase'
const ADDED_AT_KEY = 'addedAt'
const INACTIVE_AT_KEY = 'inactiveAt'

type PassphraseCacheParams = {
  storage: Storage<string | number>
  alarms: Alarms
  autoLockTimerAtom: Atom<number>
  logger: Logger
  config: { maxTtl: number }
}

export class PassphraseCache {
  #alarms
  #storage
  #autoLockTimerAtom
  #logger
  #maxTtl

  constructor({ storage, alarms, autoLockTimerAtom, logger, config }: PassphraseCacheParams) {
    this.#storage = storage
    this.#alarms = alarms
    this.#autoLockTimerAtom = autoLockTimerAtom
    this.#logger = logger
    this.#maxTtl = (config.maxTtl || 60) * ms('1m')
  }

  #getTtl = async () => {
    return this.#autoLockTimerAtom.get()
  }

  #scheduleClear = async () => {
    const ttl = await this.#getTtl()

    this.#logger.log('rescheduling cache clear', ttl / ms('1m'))
    await this.#alarms.clear('clear-passphrase')
    await this.#alarms.create('clear-passphrase', {
      delayInMinutes: ttl / ms('1m'),
    })
  }

  async set(passphrase: string) {
    this.#logger.log('caching passphrase')
    const ttl = await this.#getTtl()

    await this.#storage.batchSet({
      [PASSPHRASE_KEY]: passphrase,
      [ADDED_AT_KEY]: Date.now(),
      [TTL_KEY]: ttl,
    })
  }

  async get() {
    const [passphrase, addedAt, inactiveAt, ttl] = (await this.#storage.batchGet([
      PASSPHRASE_KEY,
      ADDED_AT_KEY,
      INACTIVE_AT_KEY,
      TTL_KEY,
    ])) as [string, number, number, number]

    if (passphrase) {
      if (inactiveAt) {
        if (inactiveAt + ttl > Date.now()) {
          this.#logger.log('fetched cached passphrase, in activity period')
          return passphrase
        }
      } else if (addedAt + this.#maxTtl > Date.now()) {
        this.#logger.log('fetched cached passphrase')
        return passphrase
      }

      this.#logger.log('fetched expired passphrase, clearing and preventing unlock')
      void this.clear()
    }

    this.#logger.log('passphrase not in cache')
  }

  async changeTtl(ttl: number) {
    const newTtl = Math.min(this.#maxTtl, ttl)

    await this.#autoLockTimerAtom.set(newTtl)

    const passphrase = await this.#storage.get(PASSPHRASE_KEY)

    if (passphrase) {
      await this.#storage.set(TTL_KEY, newTtl)

      void this.#scheduleClear()
    }
  }

  async scheduleClear() {
    const passphrase = await this.#storage.get(PASSPHRASE_KEY)

    if (passphrase) {
      await this.#storage.set(INACTIVE_AT_KEY, Date.now())

      void this.#scheduleClear()
    }
  }

  async clear() {
    this.#logger.log('clearing cache')
    await this.#storage.clear()
  }
}

const createPassphraseCache = (args: PassphraseCacheParams) => new PassphraseCache(args)

const passphraseCacheDefinition = {
  type: 'module',
  id: 'passphraseCache',
  factory: createPassphraseCache,
  dependencies: ['storage', 'alarms', 'autoLockTimerAtom', 'logger', 'config'],
} as const satisfies Definition

export default passphraseCacheDefinition
