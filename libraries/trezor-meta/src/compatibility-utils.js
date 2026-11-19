const MODEL_SAFE_3 = 'Safe 3'
const MODEL_SAFE_5 = 'Safe 5'
const MODEL_SAFE_7 = 'Safe 7'
const MODEL_T = 'T'
const MODEL_1 = '1'

// can be moved to asset configuration/feature
const supportedNetworks = {
  __proto__: null,
  bcash: { models: [MODEL_1, MODEL_T, MODEL_SAFE_3, MODEL_SAFE_5] },
  bitcoin: { allModels: true, isSegwit: true, isBip84: true },
  bitcoinregtest: { allModels: true, isSegwit: true, isBip84: true },
  dogecoin: { models: [MODEL_1, MODEL_T, MODEL_SAFE_3, MODEL_SAFE_5] },
  ethereum: { tokenSupported: true, allModels: true },
  ethereumclassic: { models: [MODEL_1, MODEL_T, MODEL_SAFE_3, MODEL_SAFE_5] },
  litecoin: {
    models: [MODEL_1, MODEL_T, MODEL_SAFE_3, MODEL_SAFE_5],
    isSegwit: true,
    isBip84: true,
  },
  stellar: { models: [MODEL_1, MODEL_T, MODEL_SAFE_3, MODEL_SAFE_5] },
  zcash: { models: [MODEL_1, MODEL_T, MODEL_SAFE_3, MODEL_SAFE_5] },
  dash: { models: [MODEL_1, MODEL_T] },
  decred: { models: [MODEL_1, MODEL_T] },
  digibyte: { models: [MODEL_1, MODEL_T], isSegwit: true },
  cardano: { models: [MODEL_SAFE_3, MODEL_SAFE_5, MODEL_T] },
  ripple: { models: [MODEL_SAFE_3, MODEL_SAFE_5, MODEL_SAFE_7, MODEL_T] },
  solana: { tokenSupported: true, models: [MODEL_SAFE_7] },
  tezos: { futureSupport: true },
  ravencoin: { futureSupport: true },
}

const isToken = ({ asset }) => asset.baseAsset.name !== asset.name

const getTrezorConfiguration = ({ asset }) => supportedNetworks[asset.baseAsset.name]

const isTrezorSupported = ({ asset, model, onlyBase }) => {
  if (!asset) return false

  if (!asset.baseAsset || asset.baseAsset.api?.features?.delisted) return false

  const config = getTrezorConfiguration({ asset })
  if (!config) return false

  const isModelSupported = !model || config.allModels || config.models?.includes(model.toString())
  if (!isModelSupported) return false

  if (isToken({ asset })) {
    return !onlyBase && !!config.tokenSupported
  }

  return true
}

const isSupportedOnlyByModelT = ({ asset }) => {
  return (
    isTrezorSupported({ asset, model: MODEL_T }) && !isTrezorSupported({ asset, model: MODEL_1 })
  )
}

export {
  supportedNetworks,
  MODEL_SAFE_3,
  MODEL_SAFE_5,
  MODEL_SAFE_7,
  MODEL_T,
  MODEL_1,
  getTrezorConfiguration,
  isTrezorSupported,
  isSupportedOnlyByModelT,
}
