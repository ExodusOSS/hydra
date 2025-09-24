import suite from './integration.suite'

const metadata = {
  applicationName: 'tronmainnet',
  models: ['nanos', 'nanosp', 'nanox', 'stax'],
  appVersions: ['0.7.0'],
}

const fixture = {
  addresses: {
    "m/44'/195'/0'/0/0": 'TWaSoh8NeP4rRgHDm9mRxWaw6EHhMtGFg5',
    "m/44'/195'/1'/0/0": 'TBTzgqdknctu9yDQkoygQ7eqhZQC1BcRq8',
  },
  publicKeys: {
    "m/44'/195'/0'/0/0": '028454c50d836bde969492d00d7278d80a649c01379d3e69aa2bab6b92ff5ae1a8',
    "m/44'/195'/1'/0/0": '030ba6ec3627a0ae1db8536c801523b4a3ce1254d782ee7a0ab2f31e5278d032d4',
  },
  transactions: [
    {
      customApproveNavigation: {
        nanos: ['Sign'],
        nanosp: ['Sign'],
        nanox: ['Sign'],
        stax: ['Hold'],
      },
      params: {
        derivationPaths: ["m/44'/195'/0'/0/0"],
        signableTransaction: Buffer.from(
          '0a02ff542208a1a1014aebaabaa740c0b4dcc2ad325a68080112640a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412330a1541e20c98eca71c536186364b6b06cb8810ceea223b1215411069e8cb896fe26a523c2ca0162d24c44569e50d189bc9c20e70c4febbc2ad32',
          'hex'
        ),
      },
      result: [
        '0dcc778b0729a278d7e87610c331bd148492d2c78905c34c8215a3d8ba96eef644f5fbbcafdc2b9f8457a1c40f7e98e86d12745e1f3225ddb8dbae091c7fcadc01',
      ],
    },
  ],
  messages: [],
}

suite('tronmainnet', metadata, fixture)
