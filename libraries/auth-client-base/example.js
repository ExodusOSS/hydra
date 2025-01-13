const { createClient } = require('@exodus/auth-client-base')

class MyClient {
  constructor(opts) {
    this._client = createClient(opts)
  }

  getPotatoes() {
    return this._client.get('potatoes', {
      auth: true,
      query: {
        fried: true,
      },
    })
  }
}

module.exports = MyClient

// initialization
// pass in a keypair of this shape
const keyPair = { privateKey: 'privateKey', publicKey: 'publicKey', sign: () => {} }
const client = new MyClient({
  config: {
    keyPair,
    baseUrl: 'http://localhost:3001',
    authChallengeUrl: 'http://localhost:3001/auth/challenge',
    authTokenUrl: 'http://localhost:3001/auth/token',
  },
  metadata: {
    build: 'genesis',
    version: '1.1.1',
    platformName: 'ios',
    osVersion: '14.4',
    dev: false,
  },
})

client.getPotatoes()
