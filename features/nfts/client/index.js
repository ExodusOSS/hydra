import createNftsProxy from './nfts-proxy.js'

const nftsProxyDefinition = {
  id: 'nftsProxy',
  type: 'module',
  factory: createNftsProxy,
  dependencies: ['config', 'fetch'],
  public: true,
}

export default nftsProxyDefinition
