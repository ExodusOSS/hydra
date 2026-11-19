import type KeyIdentifier from '@exodus/key-identifier'

type Keychain = {
  exportKey: (params: { seedId: string; keyId: KeyIdentifier }) => Promise<{ publicKey: string }>
}

type Params = {
  keychain: Keychain
  identifier: KeyIdentifier
  seedId: string
}

const getSeedDerivedId = async ({ keychain, identifier, seedId }: Params): Promise<string> => {
  const { publicKey } = await keychain.exportKey({
    seedId,
    keyId: identifier,
  })

  return Buffer.from(publicKey, 'hex').toString('base64')
}

export default getSeedDerivedId
