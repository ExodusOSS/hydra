const createPrimarySeedMetadata = async ({ adapters, modules }) => {
  const { wallet } = modules
  const storage = adapters.storage.namespace('wallet')

  const primarySeedId = await wallet.getPrimarySeedId()
  const metadata = { [primarySeedId]: { dateCreated: Date.now() } }
  await storage.set('seedMetadata', metadata)
}

const primarySeedMetadataMigration = {
  name: 'primary-seed-metadata',
  factory: createPrimarySeedMetadata,
}

export default primarySeedMetadataMigration
