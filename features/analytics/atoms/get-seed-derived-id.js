const getSeedDerivedId = async ({ keychain, identifier, seedId }) => {
  const { publicKey } = await keychain.exportKey({
    seedId,
    keyId: identifier,
  })

  return Buffer.from(publicKey, 'hex').toString('base64')
}

export default getSeedDerivedId
