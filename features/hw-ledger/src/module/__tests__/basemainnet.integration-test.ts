import * as ethers from '@exodus/ethersproject-transactions'

import suite from './integration.suite'

const metadata = {
  applicationName: 'ethereum',
  models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
  appVersions: ['1.12.0'],
}

const fixture = {
  xpubs: {
    "m/44'/60'/0'":
      'xpub661MyMwAqRbcFVCw1rW4N1kU5WjWMmXa9Jrw2gmypboEY9rknZUjjgceBrgnPSQDenpbShs68fmwY12bmXxc2Mmae4XKi79Pv3sYwR6fm59',
  },
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
        assetName: 'basemainnet',
        derivationPaths: ["m/44'/60'/0'/0/0"],
        signableTransaction: Buffer.from(
          'e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080',
          'hex'
        ),
      },
      result: [
        '422d2ac0da8e5a935aa1a4e02603910712984fde6cb4bbcb16f5727145bca3cf6a8c35f2a028efeacacff4ce0e7917eb20a980da58e1473d9abe152e77c9055b48ff',
      ],
    },
    {
      params: {
        // UnsignedTx as used by assets
        assetName: 'basemainnet',
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
              chainId: 8453,
            })
            .slice(2),
          'hex'
        ),
      },
      result: [
        '422dc4b55e512a912672106e4037e92e98a99891adf8913fb8486dcd9b95705260d07468919e72c0d31d60572a7954188ca9a5b0e834da7e5c4b6cbf9689ce074d3b',
      ],
    },
    {
      customApproveNavigation: {
        nanos: ['Accept', 'and send'],
        nanosp: ['Accept', 'and send'],
        nanox: ['Accept', 'and send'],
        stax: ['Hold'],
      },
      params: {
        // ERC-721 / NFT Transfer
        assetName: 'basemainnet',
        derivationPaths: ["m/44'/60'/0'/0/0"],
        signableTransaction: Buffer.from(
          'f88a0a852c3ce1ec008301f5679460f80121c31a0d46b5279700f9df786054aa5ee580b86442842e0e0000000000000000000000006cbcd73cd8e8a42844662f0a0e76d7f79afd933d000000000000000000000000c2907efcce4011c491bbeda8a0fa63ba7aab596c0000000000000000000000000000000000000000000000000000000000112999018080',
          'hex'
        ),
      },
      result: [
        '422ebb5bf2f2896172384d950840b988950521a28e8fee0b26151fe2d286ce80d7fd058de765470b2847339837200cf9089c4f64dda2cdf7dd24586154edcc1d20df',
      ],
    },
    {
      customApproveNavigation: {
        nanos: ['Accept', 'and send'],
        nanosp: ['Accept', 'and send'],
        nanox: ['Accept', 'and send'],
        stax: ['Hold'],
      },
      params: {
        // ERC-20 / Token Transfer
        assetName: 'basemainnet',
        derivationPaths: ["m/44'/60'/0'/0/0"],
        signableTransaction: Buffer.from(
          'f869468506a8b15e0082ebeb946b175474e89094c44da98b954eedeac495271d0f80b844095ea7b30000000000000000000000007d2768de32b0b80b7a3454c06bdac94a69ddc7a9ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018080',
          'hex'
        ),
      },
      result: [
        '422e5b041fc1f4089affae3856ce881ee9d9aad8dc7b1d3a332782cad780c10888461260fcf141295f8becbce290e0e22bdd305a017cf355f0673eaf4f9b27ead35b',
      ],
    },
  ],
  messages: [
    {
      customApproveNavigation: {
        nanos: [1, 'Sign'],
        nanosp: [1, 'Sign'],
        nanox: [1, 'Sign'],
        stax: ['Hold'],
      },
      params: {
        derivationPath: "m/44'/60'/0'/0/0",
        message: {
          rawMessage: Buffer.from('hellow world', 'ascii'),
        },
      },
      result:
        'a2cc60741514894a18b10be537f97b9cb8c93de887c97857de27f6736b19a39d749a8565b0073b151bf50ec426aae0a075ba45c80184c8e2220a422ed6e22e6d1b',
    },
    {
      customApproveNavigation: {
        nanos: [1, 'Sign'],
        nanosp: [1, 'Approve'],
        nanox: [1, 'Approve'],
        stax: ['Hold'],
      },
      params: {
        derivationPath: "m/44'/60'/0'/0/0",
        message: {
          EIP712Message: {
            domain: {
              chainId: 5,
              name: 'Ether Mail',
              verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
              version: '1',
            },
            message: {
              contents: 'Hello, Bob!',
              from: {
                name: 'Cow',
                wallets: [
                  '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
                  '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
                ],
              },
              to: {
                name: 'Bob',
                wallets: [
                  '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                  '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                  '0xB0B0b0b0b0b0B000000000000000000000000000',
                ],
              },
            },
            primaryType: 'Mail',
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
              ],
              Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' },
              ],
              Person: [
                { name: 'name', type: 'string' },
                { name: 'wallets', type: 'address[]' },
              ],
            },
          },
        },
      },
      result:
        'e2dff536e633965a27021165cb929fdb2dd47d58414a5cf7f7a337b726d23cc75593715efa94eb48f24e3fe0877ecc33a54dab2893eabb8f0685c66afc62143a1c',
    },
  ],
}

suite('basemainnet', metadata, fixture)
