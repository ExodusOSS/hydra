import { getAddressFromPublicKey as encondePublicAlgorand } from '@exodus/algorand-lib'
import { algorand as algorandFeeData } from '@exodus/algorand-lib/src/fee-data/index.js'
import { asset as algorandMeta } from '@exodus/algorand-meta'
import { createAsset as createBitcoinAsset } from '@exodus/bitcoin-plugin'
import { encodePublic as encodePublicEthereum } from '@exodus/ethereum-lib'
import { signMessage } from '@exodus/ethereum-lib/src/sign-message.js'
import { asset as ethereumMeta } from '@exodus/ethereum-meta'
import { createNoopLogger } from '@exodus/logger'
import { AccountState } from '@exodus/models'
import { createFeeData, getAddressFromPublicKey as encodePublicSolana } from '@exodus/solana-lib'
import { asset as solanaMeta } from '@exodus/solana-meta'
import assert from 'minimalistic-assert'

const createAccountStateClass = (defaultUnit) => {
  return class extends AccountState {
    static defaults = {
      cursor: '',
      balance: defaultUnit.ZERO,
    }
  }
}

const getBalancesFromTxLogs = ({ txLog }) =>
  txLog.size > 0
    ? {
        balance: txLog.getMutations().slice(-1)[0].balance,
      }
    : null

class DummyFeeMonitor {
  constructor({ assetName, updateFee }) {
    this.assetName = assetName
    this.updateFee = updateFee
    this.timer = {
      stop: async () => {},
    }
  }

  fetchFee = jest.fn(async () => {
    return { fee: 'Some fee' }
  })

  start = () => async () => {
    const feeConfig = await this.fetchFee()
    this.updateFee(this.assetName, feeConfig)
  }
}

const bitcoin = {
  ...createBitcoinAsset({
    assetClientInterface: { createLogger: createNoopLogger },
    allowUnconfirmedRbfEnabledUtxos: true,
  }),
  get baseAsset() {
    return bitcoin
  },
  get feeAsset() {
    return bitcoin
  },
}
bitcoin.api.getBalances = getBalancesFromTxLogs
bitcoin.api.createAccountState = () => createAccountStateClass('BTC')

const ethereum = {
  ...ethereumMeta,
  keys: {
    encodePublic: encodePublicEthereum,
  },
  get baseAsset() {
    return ethereum
  },
  get feeAsset() {
    return ethereum
  },
  api: {
    addressHasHistory: async () => true,
    defaultAddressPath: 'm/0/0',
    createAccountState: () => createAccountStateClass('ETH'),
    // copied from:
    // https://github.com/ExodusMovement/exodus-browser/blob/85cdef57d72ba2486acf4b1a8829790a2e97cf06/src/_local_modules/assets/ethereum-like/get-key-identifier/index.js
    getKeyIdentifier: (params) => {
      const { accountIndex, compatibilityMode, addressIndex } = params
      const isMetaMask = compatibilityMode === 'metamask'

      if (isMetaMask) {
        assert(
          addressIndex === 0,
          'MetaMask compatibility does not support setting an addressIndex'
        )
      }

      // MetaMasks bumps addressIndex instead of accountIndex
      const pathMetaMask = `m/44'/60'/0'/0/${accountIndex}`
      const pathExodus = `m/44'/60'/${accountIndex}'/0/${addressIndex}`
      const derivationPath = isMetaMask ? pathMetaMask : pathExodus

      return {
        derivationAlgorithm: 'BIP32',
        derivationPath,
        keyType: 'secp256k1',
      }
    },
    signTx: () => {},
    signMessage,
    getBalances: getBalancesFromTxLogs,
    hasFeature: (feature) =>
      ({
        feesApi: true,
        nfts: true,
      })[feature],
    features: {
      feesApi: true,
      nfts: true,
    },
    createFeeMonitor: () => new DummyFeeMonitor({ assetName: 'ethereum', updateFee: () => {} }),
    getTokens: () => [someCustomToken],
  },
}

const someCustomToken = {
  name: 'someCustomToken',
  ticker: 'SCT',
  baseAsset: ethereum,
  feeAsset: ethereum,
  isBuiltIn: false,
  units: {
    exodus: 0,
    fam: 8,
  },
  api: {
    getBalances: ({ accountState }) => ({
      balance: accountState.tokenBalances?.someCustomToken,
    }),
    hasFeature: () => false,
  },
}

const solanaFeeData = createFeeData({ asset: solanaMeta })

const solana = {
  ...solanaMeta,
  keys: {
    encodePublic: encodePublicSolana,
  },
  get baseAsset() {
    return solana
  },
  get feeAsset() {
    return solana
  },
  api: {
    defaultAddressPath: 'm/0/0',
    addressHasHistory: async () => true,
    createAccountState: () => createAccountStateClass('SOL'),
    // copied from
    // https://github.com/ExodusMovement/exodus-browser/blob/85cdef57d72ba2486acf4b1a8829790a2e97cf06/src/_local_modules/assets/solana/index.js#L38
    getKeyIdentifier: (params) => {
      const { accountIndex, compatibilityMode, addressIndex } = params

      // Phantom doesn't use chainIndex (normal vs change address)
      const pathPhantom = `m/44'/501'/${accountIndex}'/${addressIndex}'`
      const pathExodus = `m/44'/501'/${accountIndex}'/0/${addressIndex}`
      const derivationPath = compatibilityMode === 'phantom' ? pathPhantom : pathExodus

      return {
        // Phantom uses SLIP10 / ed25519
        derivationAlgorithm: compatibilityMode === 'phantom' ? 'SLIP10' : 'BIP32',
        derivationPath,
        keyType: 'nacl',
      }
    },

    signTx: () => {},
    getBalances: ({ asset, accountState }) => {
      if (asset.baseAsset === asset) {
        // accountState may not be available, e.g. for combined assets
        return accountState ? { balance: accountState.balance } : null
      }

      const balance = accountState?.tokenBalances?.[asset.name]
      return balance ? { balance } : null
    },
    hasFeature: (feature) =>
      ({
        feesApi: true,
        nfts: false,
      })[feature],
    features: {
      feesApi: true,
      nfts: false,
    },
    getFeeData: () => solanaFeeData,
    createFeeMonitor: () => new DummyFeeMonitor({ assetName: 'solana', updateFee: () => {} }),
  },
}

const algorand = {
  ...algorandMeta,
  get baseAsset() {
    return algorand
  },
  keys: {
    encodePrivate: (privateKey) => privateKey.toString('hex'),
    encodePublic: encondePublicAlgorand,
  },
  api: {
    createAccountState: () => createAccountStateClass('ALGO'),
    defaultAddressPath: 'm/0/0',
    getBalances: getBalancesFromTxLogs,
    getKeyIdentifier: ({ accountIndex, addressIndex }) => {
      //
      return {
        derivationAlgorithm: 'BIP32',
        derivationPath: `m/44'/283'/${accountIndex}'/0/${addressIndex}`,
        keyType: 'nacl',
      }
    },
    hasFeature: (feature) =>
      ({
        feesApi: true,
      })[feature],
    features: {
      feesApi: true,
    },
    getFeeData: () => algorandFeeData,
    createFeeMonitor: () => new DummyFeeMonitor({ assetName: 'algorand', updateFee: () => {} }),
  },
}

const assetPlugins = {
  bitcoin: { createAsset: () => bitcoin },
  ethereum: { createAsset: () => ethereum },
  solana: { createAsset: () => solana },
  algorand: { createAsset: () => algorand },
}

const createAssetPlugins = () => assetPlugins

export default createAssetPlugins
