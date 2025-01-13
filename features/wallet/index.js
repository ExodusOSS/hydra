import walletApi from './api/index.js'
import walletDefinition from './module/index.js'
import primarySeedIdAtomDefinition from './atoms/primary-seed-id.js'
import seedMetadataAtomDefinition from './atoms/seed-metadata.js'

const DEFAULT_MAX_EXTRA_SEEDS = 5
const DEFAULT_VALID_MNEMONIC_LENGTHS = [12]

const wallet = (
  {
    maxExtraSeeds = DEFAULT_MAX_EXTRA_SEEDS,
    validMnemonicLengths = DEFAULT_VALID_MNEMONIC_LENGTHS,
  } = Object.create(null)
) => {
  return {
    id: 'wallet',
    definitions: [
      { definition: walletDefinition, config: { maxExtraSeeds, validMnemonicLengths } },
      { definition: walletApi },
      { definition: primarySeedIdAtomDefinition },
      { definition: seedMetadataAtomDefinition, storage: { namespace: 'wallet' } },
    ],
  }
}

export default wallet
