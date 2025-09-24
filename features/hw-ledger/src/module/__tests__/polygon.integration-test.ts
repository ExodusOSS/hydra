import * as ethers from '@exodus/ethersproject-transactions'

import suite from './integration.suite'

const metadata = {
  applicationName: 'ethereum',
  models: ['nanos', 'nanosp', 'nanox', 'stax'],
  appVersions: ['1.12.0'],
}

const fixture = {
  addresses: {
    "m/44'/60'/0'/0/0": '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
    "m/44'/60'/0'/0/1": '0x5Eab80c0E218692b20Af96e1DB3B786936703fcA',
  },
  publicKeys: {
    "m/44'/60'/0'/0/0": '03b8319b0454dcc30bf37e6f6fc60ffefc838f2b7e6a15f6b546b57bc6e2569941',
    "m/44'/60'/0'/0/1": '027f4ee9b9fb0d9759a5a04534036e0f52a4a03cbd9aebdfbb0706a42daa08e246',
  },
  transactions: [
    {
      params: {
        // UnsignedTx as used by assets
        assetName: 'matic',
        derivationPaths: ["m/44'/60'/0'/0/0"],
        signableTransaction: Buffer.from(
          ethers
            .serialize({
              nonce: Buffer.from([1]),
              gasPrice: Buffer.from('2c3ce1ec00', 'hex'),
              gasLimit: Buffer.from('01f567', 'hex'),
              to: '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
              value: Buffer.alloc(0),
              data: Buffer.alloc(0),
              chainId: 137,
            })
            .slice(2),
          'hex'
        ),
      },
      result: [
        '013611e884bfe60952ae1efe107e0a7be021bf63698da76fee6958bba3da32e948530a19079bd7dc33664e200fd9f597edf0fdeeed7dc190d5820ceef32bf064d260',
      ],
    },
  ],
}

suite('matic', metadata, fixture)
