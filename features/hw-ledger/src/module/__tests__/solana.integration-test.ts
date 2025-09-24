import suite from './integration.suite'

const metadata = {
  applicationName: 'solana',
  models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
  appVersions: ['1.4.1'],
}

const fixture = {
  addresses: {
    "m/44'/501'/0'": 'A5qAhuHsx3FveB2CspArSuZ4gVHKDbZHmg38aCHYF1Ju',
    "m/44'/501'/0'/0'": 'J1f64RSxJdjduvDXuxL1BsJrJaHkw5sUEBUaRMCwphCM', // Magic Eden main account
    // "m/44'/501'/0'/1'": '9Bob6nko61ipmcEwVP9veSB4UJa8a9o96WUpP5P6D59j', // TODO: MagicEden bidding account, can't figure out the path
  },
  publicKeys: {
    "m/44'/501'/0'": '86f5f7f2c7e98ba2d5ed1e68d585d976e3fc020cbab2b3e04cdd5fe85369576e',
    "m/44'/501'/0'/0'": 'fcc1be3c6bcba958beface88582228c967e5a3b4cd3bbf27978154366f00c4ca',
  },
  transactions: [
    {
      params: {
        derivationPaths: ["m/44'/501'/0'"],
        signableTransaction: Buffer.from(
          '0100010286f5f7f2c7e98ba2d5ed1e68d585d976e3fc020cbab2b3e04cdd5fe85369576e0000000000000000000000000000000000000000000000000000000000000000030303030303030303030303030303030303030303030303030303030303030301010200000c020000008096980000000000',
          'hex'
        ),
      },
      result: [
        'ead52bd23809155933ad1cf8ff16622ace8e53c4aa06e02f32c7b14cecb73f0e7e4fc310f7d9f4a7adf360d78363cf8d1d6c762b16f8ce936ff30c562a9c7500',
      ],
    },
  ],
  messages: [
    {
      params: {
        derivationPath: "m/44'/501'/0'",
        message: {
          rawMessage: Buffer.from(
            'ff736f6c616e61206f6666636861696e00000b0068656c6c6f20776f726c64',
            'hex'
          ),
        },
      },
      result:
        '6f86880d892bbcd2133db40456fa361def53313a3e0a23b25a6dcbe6038e209454f256bdbdaf781bc6bf7daeb2276baafd8ad1410926e77fb11c8a9e3e92e40d',
    },
    {
      params: {
        derivationPath: "m/44'/501'/0'",
        message: {
          rawMessage: Buffer.from(
            'ff736f6c616e61206f6666636861696e00010b0068656c6c6f20776f726c64',
            'hex'
          ),
        },
      },
      result:
        'ec1b9e8e792bb2fbfd89eb26e88189b167e82827082e528b3a67a6b67748e255c1fe28deab526427b6e621426cc583089d01575327923ca3eab77f7abccd3b0c',
    },
  ],
}

suite('solana', metadata, fixture)
