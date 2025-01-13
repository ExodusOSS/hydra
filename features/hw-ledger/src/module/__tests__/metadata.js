export const METADATA = {
  bitcoin: {
    applicationName: 'bitcoin',
    models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
    appVersions: ['2.1.3'],
  },
  ethereum: {
    applicationName: 'ethereum',
    models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
    appVersions: ['1.12.0'],
  },
  matic: {
    applicationName: 'matic',
    baseAssetName: 'ethereum',
    models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
    appVersions: ['1.10.2'],
  },
  basemainnet: {
    applicationName: 'ethereum',
    models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
    appVersions: ['1.12.0'],
  },
  solana: {
    applicationName: 'solana',
    models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
    appVersions: ['1.4.1'],
  },
  tronmainnet: {
    applicationName: 'tronmainnet',
    models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
    appVersions: ['0.7.0'],
  },
}

export const ASSET_NAME_TO_ELF_NAME_MAP = {
  ethereum: 'Ethereum',
}

export const DEBUG = process.env.DEBUG !== undefined
