import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'
import type { WalletAccountSource } from 'libraries/models/lib/wallet-account/index.js'

import { createSoftwareWalletPublicKeysAtom } from '../../../atoms/software-wallet-public-keys.js'
import type { MoneroPublicKeyBuffer } from '../formats/serialization/index.js'
import type { StorageFormatLegacy } from '../formats/storage/legacy.js'
import publicKeyStoreDefinition from '../public-key-store.js'
import type { IPublicKeyStore, WalletAccounts } from '../types.js'
import { hardwareWalletFixture, softwareWalletFixture } from './fixture-legacy.js'

const mockHardwarePublicKeysAtom = createInMemoryAtom<StorageFormatLegacy>()
const mockSoftwarePublicKeysAtom = createSoftwareWalletPublicKeysAtom()
const mockWalletAccountsAtom = createInMemoryAtom()

const mockWalletAccounts = {
  setAccounts: jest.fn((state) => mockHardwarePublicKeysAtom.set(state)),
}

const walletAccountName = 'fixture'
const keyIdentifier = {
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/84'/0'/0'",
  keyType: 'secp256k1',
}
const xpubFixture =
  'xpub6D4u7EypFhfRS2Tq1AfFU5f48cpem3sZDmukszbhAwyBbN6YUGDhyCqZCQ3JKNwFujgj4NStfxoN21HfDsExTsxWj6j57rcBbwpDKsA9eC7'

const walletTypes = ['hardware', 'software']

describe('PublicKeyStore', () => {
  let publicKeyStore: IPublicKeyStore
  beforeEach(async () => {
    await mockHardwarePublicKeysAtom.set(hardwareWalletFixture)
    await mockSoftwarePublicKeysAtom.set(softwareWalletFixture)

    const softwareWalletAccount = new WalletAccount({ ...WalletAccount.DEFAULT })
    const hardwareWalletAccount = new WalletAccount({
      ...WalletAccount.DEFAULT,
      id: 'hardware',
      source: WalletAccount.TREZOR_SRC,
    })

    void mockWalletAccountsAtom.set({
      exodus_0: softwareWalletAccount,
      exodus_1: softwareWalletAccount,
      trezor_0_69b383b8477be56d6ff5ba24cff0c24e: hardwareWalletAccount,
      trezor_0_0ce715fa18866b68df3fafe4b98070b3: hardwareWalletAccount,
      fixture_software: softwareWalletAccount,
      fixture_hardware: hardwareWalletAccount,
    })

    publicKeyStore = publicKeyStoreDefinition.factory({
      walletAccounts: mockWalletAccounts as unknown as WalletAccounts<StorageFormatLegacy>,
      hardwareWalletPublicKeysAtom: mockHardwarePublicKeysAtom,
      softwareWalletPublicKeysAtom: mockSoftwarePublicKeysAtom,
      walletAccountsAtom: mockWalletAccountsAtom as unknown as Atom<Record<string, WalletAccount>>,
    })
  })

  describe('.constructor()', () => {
    it('should construct', async () => {
      expect(() =>
        publicKeyStoreDefinition.factory({
          walletAccounts: mockWalletAccounts as unknown as WalletAccounts<StorageFormatLegacy>,
          hardwareWalletPublicKeysAtom: mockHardwarePublicKeysAtom,
          softwareWalletPublicKeysAtom: mockSoftwarePublicKeysAtom,
          walletAccountsAtom: mockWalletAccountsAtom as unknown as Atom<
            Record<string, WalletAccount>
          >,
        })
      ).not.toThrow()
    })
  })

  describe('.add()', () => {
    const addFixtures: [
      string,
      { walletAccountName: string; keyIdentifier: any; publicKey?: any; xpub?: string },
    ][] = [
      [
        'a normal public key',
        {
          walletAccountName,
          keyIdentifier: {
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/134'/0'/0/0", // Lisk
            keyType: 'secp256k1',
          },
          publicKey: Buffer.from(
            'f1eeb909c9de0b1402279d84c0ee56ae0811663582fee802746f678473e39b33',
            'hex'
          ),
        },
      ],
      [
        'an xpub',
        {
          walletAccountName,
          keyIdentifier: {
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/84'/0'/0'",
            keyType: 'secp256k1',
          },
          xpub: 'xpub6D4u7EypFhfRS2Tq1AfFU5f48cpem3sZDmukszbhAwyBbN6YUGDhyCqZCQ3JKNwFujgj4NStfxoN21HfDsExTsxWj6j57rcBbwpDKsA9eC7',
        },
      ],
      [
        'a Monero public key',
        {
          walletAccountName,
          keyIdentifier: {
            derivationAlgorithm: 'BIP32',
            derivationPath: `m/44'/128'/0'`,
            keyType: 'legacy',
            assetName: 'monero',
          },
          publicKey: {
            spendPub: Buffer.from(
              '228e68216d3b30e2c1432dca51a6af375b9ef4faa742dac5dcc7a31ca6614a70',
              'hex'
            ),
            viewPub: Buffer.from(
              'b0744fdfa92ddc441fd2b24d3f9122938d6273cd336db044df02c3f8670fbb19',
              'hex'
            ),
            viewPriv: Buffer.from(
              '5d23dea2bbfdd9180e419545b60c08427aaa3f10757767da60099d6c0bdb140f',
              'hex'
            ),
          },
        },
      ],
    ]

    it('throws error for unsupported wallet account', async () => {
      const walletAccount = new WalletAccount({
        ...WalletAccount.DEFAULT,
        id: 'unsuported',
        source: 'unsuported' as WalletAccountSource,
      })

      await expect(
        publicKeyStore.add({
          walletAccount,
          keyIdentifier,
          xpub: xpubFixture,
        })
      ).rejects.toThrow('Wallet account is unsupported')
    })

    describe('hardware wallets', () => {
      const hardwareWallets: any[] = addFixtures.map(
        ([name, { walletAccountName, ...data }], index) => {
          return [
            name,
            {
              ...data,
              walletAccount: new WalletAccount({
                source: WalletAccount.TREZOR_SRC,
                index,
                label: walletAccountName,
                id: walletAccountName,
              }),
            },
          ]
        }
      )

      it.each(hardwareWallets)(
        'should add %s',
        async (_name, { walletAccount, keyIdentifier, publicKey, xpub }) => {
          const walletAccountName = walletAccount.toString()
          await publicKeyStore.add({
            walletAccount,
            keyIdentifier,
            publicKey,
            xpub,
          })

          expect(mockWalletAccounts.setAccounts).toHaveBeenCalled()

          // Mock fusion sync process
          await mockWalletAccountsAtom.set({ [walletAccountName]: walletAccount })

          const result = await publicKeyStore.get({
            walletAccountName: `${walletAccountName}`,
            keyIdentifier,
          })

          expect(result!.publicKey).toStrictEqual(publicKey)
          expect(result!.xpub).toStrictEqual(xpub)
        }
      )

      it('should create new wallet account if didnt exist', async () => {
        const walletAccount = new WalletAccount({
          index: 1,
          source: 'ledger',
          seedId: 'seedid',
          id: 'seedid',
        })

        await publicKeyStore.add({
          walletAccount,
          keyIdentifier,
          xpub: xpubFixture,
        })

        const walletAccountName = walletAccount.toString()

        // Mock fusion sync process
        await mockWalletAccountsAtom.set({ [walletAccountName]: walletAccount })

        const retrievedPublicKey = await publicKeyStore.get({
          walletAccountName,
          keyIdentifier,
        })

        expect(retrievedPublicKey).toEqual({ xpub: xpubFixture })
      })

      it('should throw for invalid public key', async () => {
        const walletAccount = new WalletAccount({
          id: 'test',
          index: 0,
          source: WalletAccount.TREZOR_SRC,
        })

        await expect(
          publicKeyStore.add({
            walletAccount,
            keyIdentifier,
            publicKey: 'invalidkey' as never,
          })
        ).rejects.toThrow('unable to serialize public key')
      })
    })

    describe('software wallets', () => {
      const softwareWallets: any[] = addFixtures.map(
        ([name, { walletAccountName, ...data }], index) => {
          return [
            name,
            {
              ...data,
              walletAccount: new WalletAccount({
                ...WalletAccount.DEFAULT,
                index,
                label: walletAccountName,
              }),
            },
          ]
        }
      )

      it.each(softwareWallets)(
        'should add %s',
        async (_name, { walletAccount, keyIdentifier, publicKey, xpub }) => {
          const walletAccountName = walletAccount.toString()
          await publicKeyStore.add({
            walletAccount,
            keyIdentifier,
            publicKey,
            xpub,
          })

          // Mock fusion sync process
          await mockWalletAccountsAtom.set({ [walletAccountName]: walletAccount })

          const result = await publicKeyStore.get({
            walletAccountName: `${walletAccountName}`,
            keyIdentifier,
          })

          expect(result!.publicKey).toStrictEqual(publicKey)
          expect(result!.xpub).toStrictEqual(xpub)
        }
      )

      it('should create new wallet account if didnt exist', async () => {
        const walletAccount = new WalletAccount({
          index: 1,
          source: 'ledger',
          seedId: 'seedid',
          id: 'seedid',
        })

        await publicKeyStore.add({
          walletAccount,
          keyIdentifier,
          xpub: xpubFixture,
        })

        const walletAccountName = walletAccount.toString()

        // Mock fusion sync process
        await mockWalletAccountsAtom.set({ [walletAccountName]: walletAccount })

        const retrievedPublicKey = await publicKeyStore.get({
          walletAccountName,
          keyIdentifier,
        })

        expect(retrievedPublicKey).toEqual({ xpub: xpubFixture })
      })

      it('should throw for invalid public key', async () => {
        const walletAccount = new WalletAccount({
          id: 'test',
          index: 0,
          source: WalletAccount.TREZOR_SRC,
        })

        await expect(
          publicKeyStore.add({
            walletAccount,
            keyIdentifier,
            publicKey: 'invalidkey' as never,
          })
        ).rejects.toThrow('unable to serialize public key')
      })
    })
  })

  describe('.get()', () => {
    const accountNames = new Map<string, string>([
      ['software', 'exodus_1'],
      ['hardware', 'trezor_0_0ce715fa18866b68df3fafe4b98070b3'],
    ])

    it.each(walletTypes)('(%s wallets) should retrieve a xpub', async (walletType) => {
      const retrievedKey = await publicKeyStore.get({
        walletAccountName: accountNames.get(walletType) as string,
        keyIdentifier,
      })

      expect(retrievedKey).toEqual({ xpub: xpubFixture })
    })

    it.each(walletTypes)('(%s wallets) should retrieve monero public key', async (walletType) => {
      const { publicKey } = (await publicKeyStore.get({
        walletAccountName: accountNames.get(walletType) as string,
        keyIdentifier: {
          derivationAlgorithm: 'BIP32',
          derivationPath: `m/44'/128'/0'`,
          keyType: 'legacy',
          assetName: 'monero',
        },
      }))!

      expect((publicKey as MoneroPublicKeyBuffer).spendPub.toString('hex')).toBe(
        'daced5d83c039f7e3dc4995614c78e8396a95973612322fef2287a3268f5a9c6'
      )
    })

    it.each(walletTypes)(
      '(%s wallets) should return null for unavailable public key',
      async (walletType) => {
        const retrievedKey = await publicKeyStore.get({
          walletAccountName: accountNames.get(walletType) as string,
          keyIdentifier: {
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/1337'/0'/0'",
            keyType: 'secp256k1',
          },
        })

        expect(retrievedKey).toBe(null)
      }
    )

    it.each(walletTypes)(
      '(%s wallets) should return null for unavailable wallet account name',
      async () => {
        const retrievedKey = await publicKeyStore.get({
          walletAccountName: 'unknown',
          keyIdentifier,
        })

        expect(retrievedKey).toBe(null)
      }
    )
  })

  describe('.delete()', () => {
    it('throws error for missing wallet accounts', async () => {
      await expect(
        publicKeyStore.delete({
          walletAccountName: 'missing',
        })
      ).rejects.toThrow('Wallet account not found: missing')
    })

    describe('software wallets', () => {
      it('should delete walletAccountName', async () => {
        await publicKeyStore.delete({ walletAccountName: `${walletAccountName}_software` })
        const deleted = await publicKeyStore.get({
          walletAccountName: `${walletAccountName}_software`,
          keyIdentifier,
        })

        expect(deleted).toBeNull()
      })
    })

    describe('hardware wallets', () => {
      it('should delete walletAccountName', async () => {
        await publicKeyStore.delete({ walletAccountName: `${walletAccountName}_hardware` })
        const deleted = await publicKeyStore.get({
          walletAccountName: `${walletAccountName}_hardware`,
          keyIdentifier,
        })

        expect(deleted).toBeNull()
      })
    })
  })

  describe('.clearSoftwareWalletAccountKeys()', () => {
    const listKeys = async () => {
      const software = await mockSoftwarePublicKeysAtom.get()
      const hardware = await mockHardwarePublicKeysAtom.get()
      const data = { ...software, ...hardware }

      return Object.keys(data)
    }

    it('deletes only software wallet accounts', async () => {
      await publicKeyStore.clearSoftwareWalletAccountKeys()
      const keys = await listKeys()
      expect(keys).toEqual([
        'trezor_0_69b383b8477be56d6ff5ba24cff0c24e',
        'trezor_0_0ce715fa18866b68df3fafe4b98070b3',
      ])
    })
  })
})
