import { generateMnemonic, mnemonicToSeed } from '@exodus/bip39'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import { getSeedId } from '@exodus/key-utils'
import assert from 'minimalistic-assert'
import makeConcurrent from 'make-concurrent'

import { assertMnemonic, genPassphrase } from './utils.js'

const SEED_KEY = 'seed'
const EXTRA_SEEDS_KEY = 'extraSeeds'
const GENERATED_PASSPHRASE_KEY = 'generatedPassphrase'
const HAS_USER_SET_PASSPHRASE_KEY = 'hasUserSetPassphrase'

class Wallet {
  #keychain
  #primarySeedIdAtom
  #seedMetadataAtom
  #maxExtraSeeds
  #isLocked = true
  #clock
  #logger
  #usePassword
  #useAutoGeneratedPassword
  #validMnemonicLengths

  constructor({
    keychain,
    primarySeedIdAtom,
    seedMetadataAtom,
    seedStorage,
    unsafeStorage,
    config,
    logger,
    clock = { now: () => Date.now() },
  }) {
    assert(keychain, 'missing keychain')
    assert(Number.isInteger(config.maxExtraSeeds), 'maxExtraSeeds has to be an integer')
    assert(
      Array.isArray(config.validMnemonicLengths),
      'validMnemonicLengths has to be an array of integers'
    )
    config.validMnemonicLengths.map((length) => assert(Number.isInteger(length)))

    this.#clock = clock
    this.#logger = logger
    this.#keychain = keychain
    this.#primarySeedIdAtom = primarySeedIdAtom
    this.#seedMetadataAtom = seedMetadataAtom
    this.#maxExtraSeeds = config.maxExtraSeeds
    this.#usePassword = config.usePassword
    this.#useAutoGeneratedPassword = config.useAutoGeneratedPassword
    this.#validMnemonicLengths = config.validMnemonicLengths
    this.locked = true

    // TODO: Pass namespaced storage instance to wallet module
    this.walletStorage = seedStorage.namespace('wallet')
    this.flagsStorage = unsafeStorage.namespace('flags')
  }

  #assertWalletIsUnlocked = async () => {
    const isLocked = await this.isLocked()
    assert(!isLocked, 'wallet is locked')
  }

  exists = async () => {
    const encryptedSeed = await this.walletStorage.get(SEED_KEY)
    return !!encryptedSeed
  }

  hasPassphraseSet = async () => {
    if (this.#usePassword) {
      const walletExists = await this.exists()

      // need to fallback to generatedPassphrase for backwards compatibility
      const hasPassphrase =
        (await this.walletStorage.get(HAS_USER_SET_PASSPHRASE_KEY)) ??
        !(await this.#getGeneratedPassphrase())

      return walletExists && hasPassphrase
    }

    return false
  }

  #getSeed = async ({ passphrase }) => {
    if (this.#usePassword && !passphrase && this.#useAutoGeneratedPassword) {
      passphrase = await this.#getGeneratedPassphrase()
    }

    return this.walletStorage.get(SEED_KEY, { passphrase })
  }

  #setSeed = async ({ seed, passphrase }) => {
    if (this.#usePassword) {
      if (passphrase) {
        await this.walletStorage.delete(GENERATED_PASSPHRASE_KEY)
        await this.walletStorage.set(HAS_USER_SET_PASSPHRASE_KEY, true)
      } else {
        if (this.#useAutoGeneratedPassword) {
          passphrase = genPassphrase()
          await this.walletStorage.set(GENERATED_PASSPHRASE_KEY, passphrase)
        }

        await this.walletStorage.set(HAS_USER_SET_PASSPHRASE_KEY, false)
      }
    }

    await this.walletStorage.set(SEED_KEY, seed, { passphrase })
  }

  #getGeneratedPassphrase = async () => this.walletStorage.get(GENERATED_PASSPHRASE_KEY)

  #assertMultiSeedSupport = () => {
    if (this.#maxExtraSeeds === 0) {
      throw new Error('this is a single-seed wallet')
    }
  }

  #getExtraSeedsPassphrase = async () => {
    this.#assertMultiSeedSupport()

    const { privateKey } = await this.#keychain.exportKey({
      seedId: await this.#primarySeedIdAtom.get(),
      keyId: EXODUS_KEY_IDS.EXTRA_SEEDS_ENCRYPTION,
      exportPrivate: true,
      exportPublic: false,
    })

    return privateKey
  }

  addSeed = async ({ mnemonic, label, compatibilityMode }) => {
    await this.#assertWalletIsUnlocked()

    const seed = await mnemonicToSeed({ mnemonic, format: 'buffer', validate: false })
    const seedId = getSeedId(seed)
    if (seedId === (await this.#primarySeedIdAtom.get())) {
      throw new Error('Seed already present')
    }

    const dateCreated = this.#clock.now()
    const data = { mnemonic, seed, dateCreated, compatibilityMode }
    const seeds = await this.#getExtraSeeds()
    if (seeds.length >= this.#maxExtraSeeds) {
      throw new Error('Maximum number of seeds reached')
    }

    if (seeds.some((seed) => seed.mnemonic === mnemonic)) {
      throw new Error('Seed already present')
    }

    seeds.push(data)
    await this.#setExtraSeeds(seeds)
    await this.#seedMetadataAtom.set((previous) => ({
      ...previous,
      [seedId]: { dateCreated, label, compatibilityMode },
    }))

    return this.#keychain.addSeed(data.seed)
  }

  #removeManySeedsMetadata = async (seedIds) => {
    const metadata = await this.#seedMetadataAtom.get()
    seedIds.forEach((seedId) => delete metadata[seedId])
    await this.#seedMetadataAtom.set(metadata)
  }

  removeManySeeds = async (seedIds) => {
    this.#assertMultiSeedSupport()
    await this.#assertWalletIsUnlocked()

    const primarySeedId = await this.#primarySeedIdAtom.get()
    if (seedIds.includes(primarySeedId)) {
      throw new Error('Cannot remove primary seed')
    }

    const extraSeeds = await this.#getExtraSeeds()

    const remainingSeeds = extraSeeds.filter((seed) => {
      const seedId = getSeedId(seed.seed)
      return !seedIds.includes(seedId)
    })

    const seedsToRemove = extraSeeds.filter((seed) => {
      const seedId = getSeedId(seed.seed)
      return seedIds.includes(seedId)
    })

    await this.#setExtraSeeds(remainingSeeds)
    this.#removeManySeedsMetadata(seedIds)
    this.#keychain.removeSeeds(seedsToRemove.map((seed) => seed.seed))
  }

  removeSeed = (seedId) => {
    return this.removeManySeeds([seedId])
  }

  updateSeed = async ({ seedId, label }) => {
    assert(seedId, 'missing seedId to update seed metadata')
    assert(label, 'missing label to update seed metadata')

    await this.#seedMetadataAtom.set((previous) => ({
      ...previous,
      [seedId]: {
        ...previous[seedId],
        label,
        dateUpdated: this.#clock.now(),
      },
    }))
  }

  #setExtraSeeds = async (seeds) => {
    const passphrase = await this.#getExtraSeedsPassphrase()
    await this.walletStorage.set(EXTRA_SEEDS_KEY, seeds, { passphrase })
  }

  #getExtraSeeds = async () => {
    if (this.#maxExtraSeeds === 0) return []

    const passphrase = await this.#getExtraSeedsPassphrase()
    const seeds = await this.walletStorage.get(EXTRA_SEEDS_KEY, { passphrase })
    return seeds || []
  }

  getExtraSeedIds = async () => {
    const extraSeeds = await this.#getExtraSeeds()
    return extraSeeds.map(({ seed }) => getSeedId(seed))
  }

  create = makeConcurrent(
    async ({ mnemonic, passphrase } = {}) => {
      mnemonic = mnemonic || (await generateMnemonic({ bitsize: 128 }))

      const dateCreated = this.#clock.now()
      const seedBuffer = await mnemonicToSeed({ mnemonic, format: 'buffer', validate: false })
      const seed = { mnemonic, seed: seedBuffer, dateCreated }
      const seedId = getSeedId(seedBuffer)

      await this.#keychain.clear()
      await this.#setSeed({ seed, passphrase })

      this.#seedMetadataAtom.set((previous) => ({
        ...previous,
        [seedId]: { dateCreated },
      }))

      return seedId
    },
    { concurrency: 1 }
  )

  import = makeConcurrent(
    async ({ mnemonic, passphrase }) => {
      await assertMnemonic(mnemonic, this.#validMnemonicLengths)

      await this.#keychain.clear()
      return this.create({ passphrase, mnemonic })
    },
    { concurrency: 1 }
  )

  clear = async () => {
    this.lock()

    // Avoid using this.walletStorage.clear as it's not implemented in mobile
    await Promise.all([
      this.#keychain.clear(),
      this.walletStorage.delete(SEED_KEY),
      this.walletStorage.delete(EXTRA_SEEDS_KEY),
      this.walletStorage.delete(GENERATED_PASSPHRASE_KEY),
      this.walletStorage.delete(HAS_USER_SET_PASSPHRASE_KEY),
      this.#seedMetadataAtom.set(undefined),
    ])
  }

  isLocked = async () => this.#isLocked

  lock = async () => {
    this.#keychain.removeAllSeeds()

    this.#isLocked = true
  }

  unlock = async ({ passphrase } = {}) => {
    try {
      const { seed } = await this.#getSeed({ passphrase })
      const primarySeedId = this.#keychain.addSeed(seed)
      this.#primarySeedIdAtom.set(primarySeedId)

      const extraSeeds = await this.#getExtraSeeds()
      extraSeeds.forEach(({ seed }) => this.#keychain.addSeed(seed))

      this.#isLocked = false

      return { primarySeedId }
    } catch (err) {
      this.#logger.debug('unlock() failed: wrong password', err)
      throw new Error('Wrong password. Try again.')
    }
  }

  getMnemonic = async ({ passphrase, seedId } = {}) => {
    try {
      // always need to get primary seed first to make sure the user entered the right passphrase
      // even if passed seedId is not primary
      const { mnemonic } = await this.#getSeed({ passphrase })
      if (!mnemonic) throw new Error('Wrong password. Try again.')

      if (!seedId || (await this.getPrimarySeedId()) === seedId) return mnemonic

      const extraSeeds = await this.#getExtraSeeds()
      const seed = extraSeeds.find(({ seed }) => getSeedId(seed) === seedId)
      if (!seed) throw new Error('No seed matches seedId.')
      if (!seed.mnemonic) throw new Error('No mnemonic found for seedId.')

      return seed.mnemonic
    } catch (err) {
      if (err.message === 'No seed matches seedId.') {
        this.#logger.debug('getMnemonic() failed: no seed matches seedId.')
        throw err
      }

      this.#logger.debug('getMnemonic() failed: wrong password')
      throw new Error('Wrong password. Try again.')
    }
  }

  changePassphrase = async ({ currentPassphrase, newPassphrase }) => {
    if (this.#usePassword) {
      let seed

      try {
        seed = await this.#getSeed({ passphrase: currentPassphrase })
      } catch {
        this.#logger.debug('changePassphrase() failed: wrong password')
        throw new Error('Wrong password. Try again.')
      }

      try {
        await this.#setSeed({ seed, passphrase: newPassphrase })
      } catch {
        this.#logger.debug('changePassphrase() failed')
        throw new Error('Something went wrong. Try again.')
      }
    } else {
      throw new Error('Password support is disabled')
    }
  }

  getSeedMetadata = () => this.#seedMetadataAtom.get()

  getPrimarySeedId = () => this.#primarySeedIdAtom.get()
}

const createWallet = (args = {}) => new Wallet({ ...args })

const walletDefinition = {
  id: 'wallet',
  type: 'module',
  factory: createWallet,
  dependencies: [
    'keychain',
    'primarySeedIdAtom',
    'seedStorage',
    'unsafeStorage',
    'config',
    'logger',
    'seedMetadataAtom',
    'clock?',
  ],
  public: true,
}

export default walletDefinition
